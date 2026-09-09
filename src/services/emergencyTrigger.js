import { enqueueSosAlert, dispatchAlertApi } from './sosQueue';
import { NODES } from '../data/auraSupplyChainData';

/**
 * Programmatic integration with NEXUS AI Recovery Engine & Fracture Simulator.
 * Allows autonomous dispatch or queuing of emergency SOS when severe corridor
 * fractures or lifeline depletion is detected.
 */
export async function triggerEmergencySos({
  disruptionType = 'Autonomous Fracture Detection',
  severity = 'Critical',
  nodeId = 'wh-sonapur-pass',
  nodeName = null,
  coordinates = null,
  note = 'Triggered programmatically by NEXUS AI Recovery Engine.',
  autoDispatch = true
}) {
  const node = NODES.find(n => n.id === nodeId);
  const resolvedName = nodeName || node?.name || 'Critical Supply Corridor';
  const resolvedCoords = coordinates || (node ? { latitude: node.lat, longitude: node.lng, accuracy: 50 } : null);

  const alertPayload = {
    id: `sos-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    disruptionType,
    severity,
    coordinates: resolvedCoords,
    nodeId,
    nodeName: resolvedName,
    timestamp: Date.now(),
    note: `${note} [Auto-Alert from AI Recovery Engine]`
  };

  if (!autoDispatch) {
    return alertPayload;
  }

  // Attempt network dispatch if online; fallback to IndexedDB queue if offline
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const response = await dispatchAlertApi(alertPayload);
      console.log('🚨 Programmatic SOS dispatched to /api/sos:', response);
      return { success: true, mode: 'network_dispatched', alert: alertPayload, result: response };
    } catch (err) {
      console.warn('⚠️ Network dispatch failed; falling back to IndexedDB queue:', err.message);
      await enqueueSosAlert(alertPayload);
      return { success: true, mode: 'offline_queued', alert: alertPayload, error: err.message };
    }
  } else {
    console.log('📡 Offline detected; queuing programmatic SOS in IndexedDB...');
    await enqueueSosAlert(alertPayload);
    return { success: true, mode: 'offline_queued', alert: alertPayload };
  }
}
