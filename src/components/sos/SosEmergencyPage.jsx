import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Wifi,
  WifiOff,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Radio,
  PhoneCall,
  Navigation,
  ShieldAlert,
  FileText,
  ArrowLeft,
  Smartphone,
  Database,
  Satellite,
  Bell
} from 'lucide-react';
import {
  enqueueSosAlert,
  getPendingSosAlerts,
  removePendingSosAlert,
  flushPendingSosAlerts,
  dispatchAlertApi
} from '../../services/sosQueue';
import { NODES } from '../../data/auraSupplyChainData';
import { notificationService } from '../../services/notificationService';
import { NotificationCenterBell } from '../notifications/NotificationCenterBell';

const CALAMITY_TYPES = [
  'Mountain Landslide / Rockfall',
  'Flash Flood & Highway Inundation',
  'Bridge Collapse / Rail Washout',
  'Tunnel / Sela Pass Blizzard Blockade',
  'Hospital Oxygen Reserve Depletion',
  'Fuel (POL) Depot Starvation',
  'Border Corridor Road Severance',
  'Telecom & Grid Blackout'
];

export function SosEmergencyPage({ onNavigateBack, prefilledData = null }) {
  // Network connection state
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const toggleConnectionMode = () => {
    setIsOnline(prev => {
      const next = !prev;
      if (next) {
        window.dispatchEvent(new Event('online'));
      } else {
        window.dispatchEvent(new Event('offline'));
      }
      return next;
    });
  };

  // Form Fields
  const [disruptionType, setDisruptionType] = useState(prefilledData?.disruptionType || CALAMITY_TYPES[0]);
  const [severity, setSeverity] = useState(prefilledData?.severity || 'Critical');
  const [nodeId, setNodeId] = useState(prefilledData?.nodeId || 'wh-sonapur-pass');
  const [note, setNote] = useState(prefilledData?.note || '');
  const [timestamp, setTimestamp] = useState(Date.now());

  // Geolocation state
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'acquiring' | 'locked' | 'failed'
  const [manualGps, setManualGps] = useState(false);
  const [manualLat, setManualLat] = useState('25.1234');
  const [manualLng, setManualLng] = useState('92.3456');

  // Submission Status: 'idle' | 'sending' | 'queued' | 'sent'
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [lastSentDetails, setLastSentDetails] = useState(null);

  // Pending queue from IndexedDB
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [isFlushing, setIsFlushing] = useState(false);

  // Selected node object
  const selectedNode = NODES.find(n => n.id === nodeId) || NODES[0];

  /**
   * Acquire GPS coordinates via browser Geolocation API
   */
  const captureGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('failed');
      return;
    }

    setGpsStatus('acquiring');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setGpsStatus('locked');
      },
      (error) => {
        console.warn('Geolocation acquisition error:', error.message);
        // Fallback to selected node coordinates if permission denied or unavailable
        if (selectedNode) {
          setGpsLocation({
            latitude: selectedNode.lat,
            longitude: selectedNode.lng,
            accuracy: 50,
            isNodeFallback: true
          });
          setGpsStatus('locked');
        } else {
          setGpsStatus('failed');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, [selectedNode]);

  /**
   * Reload all pending alerts from IndexedDB
   */
  const refreshPendingQueue = useCallback(async () => {
    try {
      const alerts = await getPendingSosAlerts();
      setPendingAlerts(alerts);
    } catch (err) {
      console.error('Error fetching pending alerts from IndexedDB:', err);
    }
  }, []);

  /**
   * Flush queue and handle UI update + notification dispatch
   */
  const handleFlushQueue = useCallback(async () => {
    if (!navigator.onLine || isFlushing) return;
    setIsFlushing(true);

    try {
      await flushPendingSosAlerts((dispatchedItem) => {
        setSubmitStatus('sent');
        const smsSid = dispatchedItem.result?.messageId || 'GATEWAY_DELIVERED';
        setLastSentDetails({
          id: dispatchedItem.id,
          sentAt: dispatchedItem.sentAt,
          smsSid,
          recipient: dispatchedItem.result?.recipient || 'NDMA / MDoNER Emergency Strategic Cell (+91 98765 43210)',
          alert: dispatchedItem.alert
        });

        // Record in Notification Center
        notificationService.addNotification({
          id: `sos-flushed-${Date.now()}-${dispatchedItem.id}`,
          title: `✅ Queued SOS Dispatched: ${dispatchedItem.alert.disruptionType}`,
          desc: `Auto-transmitted on signal recovery to NDMA/MDoNER Desk. Ref: ${smsSid}. Sector: ${dispatchedItem.alert.nodeName}. Severity: ${dispatchedItem.alert.severity.toUpperCase()}.`,
          time: 'Just now',
          type: 'crisis',
          unread: true,
          actionTab: 'sos',
          actionLabel: 'View SOS Alert',
          isSos: true,
          status: 'dispatched',
          smsSid,
          nodeName: dispatchedItem.alert.nodeName,
          coordinates: dispatchedItem.alert.coordinates
        });
      });
      await refreshPendingQueue();
    } finally {
      setIsFlushing(false);
    }
  }, [isFlushing, refreshPendingQueue]);

  /**
   * CONDITIONAL SERVICE WORKER REGISTRATION (Scope: Only when /sos mounts)
   * and ONLINE/OFFLINE + iOS SAFARI FALLBACK LISTENERS
   */
  useEffect(() => {
    // Only register the service worker when this /sos route is actively visited
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/sw.js', { scope: '/sos' })
        .then((reg) => {
          console.log('✅ SOS Service Worker registered with scope /sos:', reg.scope);
        })
        .catch((err) => {
          console.warn('⚠️ Service Worker registration failed:', err);
        });

      // Listen for messages from SW (e.g. background sync completed)
      const handleSwMessage = (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETED') {
          console.log('📡 Received SYNC_COMPLETED from Service Worker:', event.data);
          refreshPendingQueue();
          setSubmitStatus('sent');
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, [refreshPendingQueue]);

  // Online / Offline and iOS Safari fallback lifecycle
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connectivity restored (online event)');
      setIsOnline(true);
      // Immediately flush any queued alerts
      handleFlushQueue();
    };

    const handleOffline = () => {
      console.log('📡 Signal lost (offline event)');
      setIsOnline(false);
    };

    // iOS Safari Fallbacks: visibilitychange, pageshow (bfcache resume), and focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        console.log('📲 App foregrounded (visibilitychange fallback on iOS Safari) — triggering flush');
        handleFlushQueue();
      }
    };

    const handlePageShow = (event) => {
      if (navigator.onLine) {
        console.log('📲 App resumed from background/bfcache (pageshow fallback on iOS Safari) — triggering flush');
        handleFlushQueue();
      }
    };

    const handleWindowFocus = () => {
      if (navigator.onLine) {
        handleFlushQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleWindowFocus);

    // Initial load checks
    captureGps();
    refreshPendingQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [captureGps, handleFlushQueue, refreshPendingQueue]);

  // Audio & Haptic feedback helper
  const triggerFeedbackBeep = (type = 'success') => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type === 'success' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(type === 'success' ? 587.33 : 440, ctx.currentTime);
        osc.frequency.setValueAtTime(type === 'success' ? 880 : 330, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // AudioContext autoplay restriction fallback
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 150]);
      } catch {}
    }
  };

  // Keep timestamp fresh
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-reset 'sent' state after 8 seconds so user can send again
  useEffect(() => {
    if (submitStatus === 'sent') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  /**
   * Form submission handler:
   * Direct send if online, else save to IndexedDB "pending-sos" store
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If currently showing 'sent' confirmation, clicking resets the form for another entry
    if (submitStatus === 'sent') {
      setSubmitStatus('idle');
      return;
    }

    if (submitStatus === 'sending') {
      return;
    }

    const coordinates = manualGps
      ? { latitude: parseFloat(manualLat) || 25.1234, longitude: parseFloat(manualLng) || 92.3456, accuracy: 25 }
      : (gpsLocation || { latitude: selectedNode?.lat || 25.5, longitude: selectedNode?.lng || 92.5, accuracy: 50 });

    const alertPayload = {
      id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      disruptionType: disruptionType || CALAMITY_TYPES[0],
      severity,
      coordinates,
      nodeId,
      nodeName: selectedNode?.name || 'Field Sector',
      timestamp,
      note: note.trim()
    };

    // 1. Enter "Sending..." state
    setSubmitStatus('sending');
    setStatusMessage('Transmitting emergency SOS payload...');

    // If device or simulator is offline, queue immediately in IndexedDB
    const isEffectiveOnline = isOnline && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    if (!isEffectiveOnline) {
      try {
        // Guarantee visible sending state for 600ms
        await new Promise(r => setTimeout(r, 600));
        await enqueueSosAlert(alertPayload);
        setSubmitStatus('queued');
        setStatusMessage('Signal offline. Alert queued locally on device.');
        triggerFeedbackBeep('queued');
        await refreshPendingQueue();

        // Push to Notification Center in Bell icon
        notificationService.addNotification({
          id: `sos-queued-${Date.now()}`,
          title: `⏳ SOS Queued (Offline): ${alertPayload.disruptionType}`,
          desc: `Saved to device storage. Transmitting to NDMA/MDoNER Desk upon signal recovery. Sector: ${alertPayload.nodeName}. Severity: ${alertPayload.severity.toUpperCase()}.${alertPayload.note ? ` Note: "${alertPayload.note}"` : ''}`,
          time: 'Just now',
          type: 'crisis',
          unread: true,
          actionTab: 'sos',
          actionLabel: 'View Offline Queue',
          isSos: true,
          status: 'queued',
          nodeName: alertPayload.nodeName,
          coordinates: alertPayload.coordinates
        });
      } catch (err) {
        console.error('Failed to queue SOS offline:', err);
        setSubmitStatus('idle');
        alert('Could not save alert locally: ' + err.message);
      }
      return;
    }

    // If device appears online, attempt network POST
    try {
      const [response] = await Promise.all([
        dispatchAlertApi(alertPayload),
        new Promise(r => setTimeout(r, 650)) // Ensure at least 650ms for clear visual feedback
      ]);
      const smsRef = response.messageId || 'DISPATCHED';
      setSubmitStatus('sent');
      setLastSentDetails({
        id: alertPayload.id,
        sentAt: Date.now(),
        smsSid: smsRef,
        recipient: response.recipient || 'NDMA / MDoNER Emergency Strategic Cell (+91 98765 43210)',
        alert: alertPayload
      });
      triggerFeedbackBeep('success');

      // Dispatch into centralized notificationService (Notification Bell Center)
      notificationService.addNotification({
        id: `sos-${Date.now()}`,
        title: `🚨 SOS Field Alert: ${alertPayload.disruptionType}`,
        desc: `Emergency dispatch to NDMA/MDoNER Desk (+91 98765 43210). Ref: ${smsRef}. Sector: ${alertPayload.nodeName}. Severity: ${alertPayload.severity.toUpperCase()}.${alertPayload.note ? ` Notes: "${alertPayload.note}"` : ''}`,
        time: 'Just now',
        type: 'crisis',
        unread: true,
        actionTab: 'sos',
        actionLabel: 'View SOS Alert',
        isSos: true,
        status: 'dispatched',
        smsSid: smsRef,
        nodeName: alertPayload.nodeName,
        coordinates: alertPayload.coordinates
      });

      // Also add inter-agency message entry
      notificationService.addMessage({
        id: `msg-sos-${Date.now()}`,
        sender: 'NDMA / MDoNER Strategic Cell (SOS Telemetry)',
        avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop&q=80',
        subject: `SOS Alert Acknowledged: ${alertPayload.disruptionType}`,
        preview: `Gateway confirmed Ref: ${smsRef}. Sector: ${alertPayload.nodeName}. Coordinates: ${alertPayload.coordinates?.latitude?.toFixed(4)}°N, ${alertPayload.coordinates?.longitude?.toFixed(4)}°E.`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        unread: true,
        actionTab: 'sos'
      });

      // Clear form note
      setNote('');
    } catch (networkError) {
      console.warn('Network request failed despite online indicator. Queuing alert into IndexedDB:', networkError.message);
      // Automatic fallback to IndexedDB queue on network drop
      try {
        await enqueueSosAlert(alertPayload);
        setSubmitStatus('queued');
        setStatusMessage('Network dropped during transit. Alert saved to offline queue.');
        triggerFeedbackBeep('queued');
        await refreshPendingQueue();

        // Push to Notification Center in Bell icon
        notificationService.addNotification({
          id: `sos-fallback-${Date.now()}`,
          title: `⏳ SOS Queued (Signal Drop): ${alertPayload.disruptionType}`,
          desc: `Network dropped during transit. Stored safely in local persistent database. Sector: ${alertPayload.nodeName}. Severity: ${alertPayload.severity.toUpperCase()}.`,
          time: 'Just now',
          type: 'crisis',
          unread: true,
          actionTab: 'sos',
          actionLabel: 'View Offline Queue',
          isSos: true,
          status: 'queued',
          nodeName: alertPayload.nodeName,
          coordinates: alertPayload.coordinates
        });
      } catch (idbErr) {
        console.error('IndexedDB queue error:', idbErr);
        setSubmitStatus('idle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-16">
      {/* Top Banner Header - Clean Light Theme */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-50 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
                title="Return to Command Center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
              <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2 font-sans">
                NEXUS <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-red-600 text-white rounded-md shadow-xs">SOS FIELD ALERT</span>
              </h1>
            </div>
          </div>

          {/* Right Controls: Notification Bell + Real-time Connection Indicator */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Center in Bell Icon Above */}
            <NotificationCenterBell
              onNavigateSos={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              align="right"
            />

            {/* Connection Mode Pill */}
            <button
              type="button"
              onClick={toggleConnectionMode}
              title="Click to toggle between Online and Offline field simulation mode"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs hover:scale-102 ${
                isOnline
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse hover:bg-rose-100'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  <span>CELLULAR / INTERNET ONLINE</span>
                  <span className="text-[10px] text-emerald-700 underline ml-1 font-normal hidden sm:inline">(Tap to test Offline)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span>OFFLINE — LOCAL QUEUE ACTIVE</span>
                  <span className="text-[10px] text-red-700 underline ml-1 font-normal hidden sm:inline">(Tap to Reconnect)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* Offline & Resiliency Guarantee Notice Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 flex items-start space-x-3.5 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0 mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs space-y-1 text-slate-700">
            <p className="font-bold text-slate-900 text-sm">
              Zero-Connectivity Guaranteed SOS Dispatch:
            </p>
            <p className="text-slate-600 leading-relaxed">
              When working in deep valleys, mountain landslide cuts, or cellular dead zones, submissions are instantly stored in your browser's persistent database. 
              Dispatched messages automatically route into the <strong>Notification Center in the Bell icon above</strong> and transmit the moment any transient 2G/EDGE or satellite ping connects.
            </p>
          </div>
        </div>

        {/* 3-STATE TOP STATUS UI BANNER */}
        {submitStatus !== 'idle' && (
          <div className="transition-all duration-300">
            {submitStatus === 'sending' && (
              <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-400 flex items-center space-x-3 text-blue-900 shadow-sm">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="text-sm font-semibold">
                  <span>Sending...</span>
                  <span className="text-xs text-blue-700 ml-2 font-normal">Contacting emergency relay gateway</span>
                </div>
              </div>
            )}

            {submitStatus === 'queued' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-between text-amber-950 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-amber-600 animate-pulse" />
                  <div>
                    <div className="text-sm font-black text-amber-900">
                      Queued — waiting for signal
                    </div>
                    <div className="text-xs text-amber-800">
                      Alert saved to device storage and added to Notification Center ({pendingAlerts.length} in queue). It will auto-transmit immediately upon signal detection.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFlushQueue}
                  disabled={!isOnline || isFlushing}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
                  Retry Now
                </button>
              </div>
            )}

            {submitStatus === 'sent' && lastSentDetails && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
                      <span>Sent to Gateway ✅</span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                        {new Date(lastSentDetails.sentAt).toLocaleTimeString('en-IN', { hour12: false })} IST
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Emergency SMS Dispatched to NDMA/MDoNER Desk (Ref: <span className="font-mono font-bold">{lastSentDetails.smsSid}</span>) — Added to Bell Notification Center
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="self-end md:self-auto text-xs text-emerald-700 hover:text-emerald-900 underline font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* SOS Alert Form - Clean Light Theme */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 text-slate-900">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 font-sans">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Incident Disruption Telemetry Form
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Field responders: fill out this streamlined report. Geolocation and timestamp are captured automatically.
            </p>
          </div>

          {/* Calamity Type Selector (Dropdown, Presets, and Text Input) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Disruption / Calamity Nature <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Select dropdown or type below</span>
            </div>

            {/* Dropdown Menu */}
            <select
              value={CALAMITY_TYPES.includes(disruptionType) ? disruptionType : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setDisruptionType(e.target.value);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer shadow-2xs"
            >
              {CALAMITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="custom">Other / Custom Disruption...</option>
            </select>

            {/* Quick-Select Field Preset Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CALAMITY_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setDisruptionType(type)}
                  className={`p-2.5 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    disruptionType === type
                      ? 'border-2 border-red-600 bg-red-50 text-red-950 shadow-xs ring-1 ring-red-500 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Custom Text Field */}
            <div className="pt-1">
              <input
                type="text"
                value={disruptionType}
                onChange={(e) => setDisruptionType(e.target.value)}
                placeholder="Or specify custom calamity description here..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium shadow-2xs"
              />
            </div>
          </div>

          {/* Severity & Affected Node Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Disruption Severity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'Critical', activeClass: 'border-2 border-red-600 bg-red-50 text-red-950 font-black shadow-xs ring-1 ring-red-500' },
                  { level: 'Severe', activeClass: 'border-2 border-orange-600 bg-orange-50 text-orange-950 font-black shadow-xs ring-1 ring-orange-500' },
                  { level: 'Moderate', activeClass: 'border-2 border-amber-600 bg-amber-50 text-amber-950 font-black shadow-xs ring-1 ring-amber-500' }
                ].map(({ level, activeClass }) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`py-2 px-3 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      severity === level ? activeClass : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Node */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Strategic Logistics Node / Sector
              </label>
              <select
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer shadow-2xs"
              >
                {NODES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Geolocation Section */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Auto-Captured GPS Location
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    gpsStatus === 'locked'
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                      : gpsStatus === 'acquiring'
                      ? 'bg-blue-100 border border-blue-300 text-blue-800 animate-pulse'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {gpsStatus === 'locked' ? 'GPS Locked' : gpsStatus === 'acquiring' ? 'Acquiring Lock...' : 'Sensor Ready'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={captureGps}
                  className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${gpsStatus === 'acquiring' ? 'animate-spin' : ''}`} />
                  Re-acquire
                </button>
                <button
                  type="button"
                  onClick={() => setManualGps(!manualGps)}
                  className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                >
                  {manualGps ? 'Use Sensor' : 'Manual Edit'}
                </button>
              </div>
            </div>

            {!manualGps ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] font-bold">Latitude</span>
                  <span className="font-mono font-bold text-slate-900">
                    {gpsLocation?.latitude ? gpsLocation.latitude.toFixed(5) + '° N' : 'Acquiring...'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] font-bold">Longitude</span>
                  <span className="font-mono font-bold text-slate-900">
                    {gpsLocation?.longitude ? gpsLocation.longitude.toFixed(5) + '° E' : 'Acquiring...'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] font-bold">Precision Accuracy</span>
                  <span className="font-mono font-bold text-emerald-600">
                    ±{Math.round(gpsLocation?.accuracy || 15)} meters
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Manual Latitude</label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-red-500 font-semibold"
                    placeholder="25.1234"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Manual Longitude</label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-red-500 font-semibold"
                    placeholder="92.3456"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timestamp & Operator Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">Incident Timestamp</span>
                <span className="font-mono font-bold text-slate-800">
                  {new Date(timestamp).toLocaleDateString('en-IN', { dateStyle: 'medium' })}{' '}
                  {new Date(timestamp).toLocaleTimeString('en-IN', { hour12: false })} IST
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <PhoneCall className="w-4 h-4 text-red-500" />
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">Emergency Dispatch Target</span>
                <span className="font-mono font-bold text-slate-800">
                  NDMA / MDoNER Strategic Cell (+91 98765 43210)
                </span>
              </div>
            </div>
          </div>

          {/* Optional Field Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Field Situational Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., 20+ POL tankers stranded near Sonapur tunnel entrance; road surface cracked; local BRO excavator unit en route..."
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium shadow-2xs"
            />
          </div>

          {/* INLINE STATUS BANNER (Directly above button so responder gets 0-scroll confirmation) */}
          {submitStatus === 'sent' && lastSentDetails && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/80 border-2 border-emerald-500 text-emerald-950 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-700 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-emerald-950 tracking-wide uppercase">
                        Emergency SOS Dispatched! ✅
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white uppercase">
                        GATEWAY CONFIRMED
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        Added to Bell Notification Center 🔔
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Dispatched to NDMA / MDoNER Emergency Strategic Cell. Twilio SMS Ref:{' '}
                      <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {lastSentDetails.smsSid}
                      </span>
                    </p>
                    <div className="text-[11px] text-emerald-700 flex items-center gap-3 pt-1 font-medium">
                      <span>Target: {lastSentDetails.recipient}</span>
                      <span>•</span>
                      <span>Dispatched at {new Date(lastSentDetails.sentAt).toLocaleTimeString('en-IN', { hour12: false })} IST</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="text-xs text-emerald-700 hover:text-emerald-950 underline font-bold px-2 py-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {submitStatus === 'queued' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/80 border-2 border-amber-500 text-amber-950 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-400 text-amber-700 flex-shrink-0">
                    <Database className="w-6 h-6 text-amber-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-amber-950 tracking-wide uppercase">
                        Alert Saved to Device Storage ⏳
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-600 text-white uppercase">
                        OFFLINE QUEUED
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        Added to Bell Notification Center 🔔
                      </span>
                    </div>
                    <p className="text-xs text-amber-900">
                      Zero-connectivity protocol active. SOS alert stored in persistent browser database ({pendingAlerts.length} in queue). 
                      It will auto-transmit immediately upon signal recovery.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="text-xs text-amber-800 hover:text-amber-950 underline font-bold px-2 py-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitStatus === 'sending'}
            className={`w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide uppercase shadow-lg transition-all duration-300 flex items-center justify-center space-x-2.5 cursor-pointer disabled:cursor-not-allowed group ${
              submitStatus === 'sent'
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/20 hover:scale-[1.005] active:scale-[0.99]'
                : submitStatus === 'queued'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 ring-4 ring-amber-500/20 hover:scale-[1.005] active:scale-[0.99]'
                : submitStatus === 'sending'
                ? 'bg-red-700 text-white/90 cursor-wait shadow-red-900/30'
                : 'bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/25 hover:scale-[1.005] active:scale-[0.99]'
            }`}
          >
            {submitStatus === 'sending' ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Transmitting Emergency SOS Alert...</span>
              </>
            ) : submitStatus === 'sent' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                <span>Emergency SOS Dispatched! (Click to Send Another)</span>
              </>
            ) : submitStatus === 'queued' ? (
              <>
                <Database className="w-5 h-5 text-slate-950 animate-pulse" />
                <span>Saved Offline (Will Transmit on Signal Detection)</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Broadcast Emergency SOS Alert</span>
              </>
            )}
          </button>
        </form>

        {/* PENDING OFFLINE QUEUE DRAWER (Visible when items are in IndexedDB) */}
        {pendingAlerts.length > 0 && (
          <div className="bg-white border border-amber-300 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Local Device Queue ({pendingAlerts.length} Pending Alert{pendingAlerts.length > 1 ? 's' : ''})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleFlushQueue}
                disabled={!isOnline || isFlushing}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
                Force Sync Now
              </button>
            </div>

            <div className="space-y-2">
              {pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{alert.disruptionType}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Node: {alert.nodeName}</span>
                      <span>•</span>
                      <span>Queued: {new Date(alert.queuedAt).toLocaleTimeString('en-IN')}</span>
                      {alert.retryCount > 0 && (
                        <span className="text-amber-700 font-bold">({alert.retryCount} attempts)</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await removePendingSosAlert(alert.id);
                      refreshPendingQueue();
                    }}
                    className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded cursor-pointer font-semibold"
                    title="Cancel this queued alert"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING TOAST NOTIFICATION (Fixed at bottom right, visible regardless of scroll position) */}
      {submitStatus === 'sent' && lastSentDetails && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100%-3rem)] bg-white border-2 border-emerald-500 text-slate-900 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-start space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <div className="font-black text-slate-900 flex items-center justify-between">
              <span>EMERGENCY SOS DISPATCHED ✅</span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                {lastSentDetails.smsSid}
              </span>
            </div>
            <p className="text-slate-600">
              Dispatched to NDMA/MDoNER Desk (+91 98765 43210). Routed to Bell Notification Center.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitStatus('idle')}
            className="text-slate-400 hover:text-slate-800 text-base leading-none px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
