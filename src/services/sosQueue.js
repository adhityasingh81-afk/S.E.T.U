import { openDB } from 'idb';

const DB_NAME = 'nexus-sos-db';
const DB_VERSION = 1;
const STORE_NAME = 'pending-sos';

/**
 * Initialize or open the SOS IndexedDB database
 */
export async function initSosDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('queuedAt', 'queuedAt');
      }
    },
  });
}

/**
 * Enqueue a new SOS alert into IndexedDB
 * @param {Object} alertData
 * @returns {Promise<Object>} The stored alert object with generated id and queued timestamp
 */
export async function enqueueSosAlert(alertData) {
  const db = await initSosDb();
  const alert = {
    id: alertData.id || `sos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    disruptionType: alertData.disruptionType || 'Unspecified Disruption',
    severity: alertData.severity || 'Critical',
    coordinates: alertData.coordinates || null,
    nodeId: alertData.nodeId || 'field-operator',
    nodeName: alertData.nodeName || 'Field Sector',
    timestamp: alertData.timestamp || Date.now(),
    note: alertData.note || '',
    queuedAt: Date.now(),
    status: 'queued',
    retryCount: 0
  };

  await db.put(STORE_NAME, alert);

  // Attempt to register Background Sync if available (Chrome / Android)
  await requestBackgroundSync();

  return alert;
}

/**
 * Retrieve all pending SOS alerts from IndexedDB
 * @returns {Promise<Array>}
 */
export async function getPendingSosAlerts() {
  try {
    const db = await initSosDb();
    return await db.getAll(STORE_NAME);
  } catch (err) {
    console.error('Failed to read from SOS IndexedDB:', err);
    return [];
  }
}

/**
 * Remove a specific alert from the pending queue after successful dispatch
 * @param {string} id
 */
export async function removePendingSosAlert(id) {
  try {
    const db = await initSosDb();
    await db.delete(STORE_NAME, id);
  } catch (err) {
    console.error(`Failed to delete alert ${id} from IndexedDB:`, err);
  }
}

/**
 * Dispatch an individual alert to the backend /api/sos
 * @param {Object} alert
 * @returns {Promise<Object>}
 */
export async function dispatchAlertApi(alert) {
  const response = await fetch('/api/sos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: alert.id,
      disruptionType: alert.disruptionType,
      severity: alert.severity,
      coordinates: alert.coordinates,
      nodeId: alert.nodeId,
      nodeName: alert.nodeName,
      timestamp: alert.timestamp,
      note: alert.note,
      queuedAt: alert.queuedAt
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Server returned ${response.status}: ${errText}`);
  }

  return await response.json();
}

/**
 * Flush all pending alerts from IndexedDB.
 * Used on online event, visibility change (iOS Safari fallback), and on-demand.
 * @param {Function} onItemProcessed Optional callback for each processed alert
 * @returns {Promise<{ dispatched: number, failed: number }>}
 */
export async function flushPendingSosAlerts(onItemProcessed) {
  if (!navigator.onLine) {
    return { dispatched: 0, failed: 0 };
  }

  const pending = await getPendingSosAlerts();
  if (pending.length === 0) {
    return { dispatched: 0, failed: 0 };
  }

  let dispatched = 0;
  let failed = 0;

  for (const alert of pending) {
    try {
      const result = await dispatchAlertApi(alert);
      await removePendingSosAlert(alert.id);
      dispatched++;

      if (onItemProcessed) {
        onItemProcessed({
          id: alert.id,
          success: true,
          alert,
          result,
          sentAt: Date.now()
        });
      }
    } catch (err) {
      console.warn(`Could not dispatch queued alert ${alert.id}:`, err.message);
      failed++;
      // Increment retryCount in DB
      try {
        const db = await initSosDb();
        const current = await db.get(STORE_NAME, alert.id);
        if (current) {
          current.retryCount = (current.retryCount || 0) + 1;
          current.lastError = err.message;
          await db.put(STORE_NAME, current);
        }
      } catch {}
    }
  }

  return { dispatched, failed };
}

/**
 * Request Background Sync for Chrome/Android
 */
export async function requestBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration?.sync) {
        await registration.sync.register('sync-sos');
        console.log('✅ Background Sync "sync-sos" registered successfully');
      }
    } catch (err) {
      console.warn('Background Sync registration not supported or failed:', err);
    }
  }
}
