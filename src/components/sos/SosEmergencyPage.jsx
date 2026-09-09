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
  Satellite
} from 'lucide-react';
import {
  enqueueSosAlert,
  getPendingSosAlerts,
  removePendingSosAlert,
  flushPendingSosAlerts,
  dispatchAlertApi
} from '../../services/sosQueue';
import { NODES } from '../../data/auraSupplyChainData';

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
   * Flush queue and handle UI update
   */
  const handleFlushQueue = useCallback(async () => {
    if (!navigator.onLine || isFlushing) return;
    setIsFlushing(true);

    try {
      await flushPendingSosAlerts((dispatchedItem) => {
        setSubmitStatus('sent');
        setLastSentDetails({
          id: dispatchedItem.id,
          sentAt: dispatchedItem.sentAt,
          smsSid: dispatchedItem.result?.messageId || 'DELIVERED',
          recipient: dispatchedItem.result?.recipient || 'Emergency Response Desk',
          alert: dispatchedItem.alert
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
    // 1. Conditionally register service worker only on this page
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('✅ Service Worker registered for /sos page:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });

      // Listen for Background Sync completion broadcast from SW
      const handleSwMessage = (event) => {
        if (event.data?.type === 'SOS_SYNCED') {
          console.log('🔔 Received SOS_SYNCED broadcast from Service Worker:', event.data);
          setSubmitStatus('sent');
          setLastSentDetails({
            id: event.data.id,
            sentAt: event.data.sentAt,
            smsSid: event.data.result?.messageId || 'SYNCED_IN_BACKGROUND',
            recipient: event.data.result?.recipient || 'Emergency Response Desk'
          });
          refreshPendingQueue();
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

    // iOS Safari Fallback: visibilitychange triggers flush when app is reopened/foregrounded
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        console.log('📲 App foregrounded (visibilitychange fallback on iOS Safari) — triggering flush');
        handleFlushQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial load checks
    captureGps();
    refreshPendingQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [captureGps, handleFlushQueue, refreshPendingQueue]);

  // Keep timestamp fresh
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Form submission handler:
   * Direct send if online, else save to IndexedDB "pending-sos" store
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const coordinates = manualGps
      ? { latitude: parseFloat(manualLat), longitude: parseFloat(manualLng), accuracy: 25 }
      : (gpsLocation || { latitude: selectedNode?.lat || 25.5, longitude: selectedNode?.lng || 92.5, accuracy: 50 });

    const alertPayload = {
      id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      disruptionType,
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
        await enqueueSosAlert(alertPayload);
        setSubmitStatus('queued');
        setStatusMessage('Signal offline. Alert queued locally on device.');
        await refreshPendingQueue();
      } catch (err) {
        console.error('Failed to queue SOS offline:', err);
        setSubmitStatus('idle');
        alert('Could not save alert locally: ' + err.message);
      }
      return;
    }

    // If device appears online, attempt network POST
    try {
      const response = await dispatchAlertApi(alertPayload);
      setSubmitStatus('sent');
      setLastSentDetails({
        id: alertPayload.id,
        sentAt: Date.now(),
        smsSid: response.messageId || 'DISPATCHED',
        recipient: response.recipient || 'Emergency Response Desk',
        alert: alertPayload
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
        await refreshPendingQueue();
      } catch (idbErr) {
        console.error('IndexedDB queue error:', idbErr);
        setSubmitStatus('idle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-12">
      {/* Top Banner Header */}
      <header className="border-b border-red-900/40 bg-slate-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                title="Return to Command Center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                NEXUS <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-red-600/90 text-white rounded">SOS Field Alert</span>
              </h1>
            </div>
          </div>

          {/* Real-time Connection Indicator with Interactive Simulation Toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleConnectionMode}
              title="Click to toggle between Online and Offline field simulation mode"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 ${
                isOnline
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-red-950/80 border-red-500/80 text-red-200 animate-pulse hover:bg-red-900/80'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>CELLULAR / INTERNET ONLINE</span>
                  <span className="text-[10px] text-emerald-400/80 underline ml-1 font-normal">(Tap to test Offline)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span>OFFLINE — LOCAL QUEUE ACTIVE</span>
                  <span className="text-[10px] text-red-300 underline ml-1 font-normal">(Tap to Reconnect)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* Offline & Resiliency Guarantee Notice */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 shadow-lg">
          <Radio className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs space-y-1 text-slate-300">
            <p className="font-semibold text-white">
              Zero-Connectivity Guaranteed SOS Dispatch:
            </p>
            <p className="text-slate-400">
              When working in deep valleys, mountain landslide cuts, or cellular dead zones, submissions are instantly stored in your browser's persistent database. 
              Background Sync &amp; iOS event hooks dispatch the alert automatically the moment even a transient 2G/EDGE or satellite ping connects.
            </p>
          </div>
        </div>

        {/* 3-STATE STATUS UI BANNER */}
        {submitStatus !== 'idle' && (
          <div className="transition-all duration-300">
            {submitStatus === 'sending' && (
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-500/50 flex items-center space-x-3 text-blue-200">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <div className="text-sm font-semibold">
                  <span>Sending...</span>
                  <span className="text-xs text-blue-300 ml-2 font-normal">Contacting emergency relay gateway</span>
                </div>
              </div>
            )}

            {submitStatus === 'queued' && (
              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/70 flex items-center justify-between text-amber-200">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <div className="text-sm font-bold text-amber-300">
                      Queued — waiting for signal
                    </div>
                    <div className="text-xs text-amber-400/90">
                      Alert saved to device storage ({pendingAlerts.length} in queue). It will auto-transmit immediately upon signal detection.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFlushQueue}
                  disabled={!isOnline || isFlushing}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
                  Retry Now
                </button>
              </div>
            )}

            {submitStatus === 'sent' && lastSentDetails && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-emerald-300 flex items-center gap-2">
                      <span>Sent ✅</span>
                      <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700/50">
                        {new Date(lastSentDetails.sentAt).toLocaleTimeString('en-IN', { hour12: false })} IST
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      Twilio Emergency SMS Dispatched to NDMA/MDoNER Desk (Ref: <span className="font-mono">{lastSentDetails.smsSid}</span>)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="self-end md:self-auto text-xs text-emerald-400 hover:text-emerald-200 underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* SOS Alert Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Incident Disruption Telemetry Form
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Field responders: fill out this streamlined report. Geolocation and timestamp are captured automatically.
            </p>
          </div>

          {/* Calamity Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Disruption / Calamity Nature <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CALAMITY_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setDisruptionType(type)}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                    disruptionType === type
                      ? 'border-red-500 bg-red-950/40 text-red-200 shadow-md ring-1 ring-red-500'
                      : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Severity & Affected Node Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Disruption Severity <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'Critical', color: 'border-red-500 bg-red-950/60 text-red-200' },
                  { level: 'Severe', color: 'border-orange-500 bg-orange-950/60 text-orange-200' },
                  { level: 'Moderate', color: 'border-amber-500 bg-amber-950/60 text-amber-200' }
                ].map(({ level, color }) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`py-2 px-3 text-center rounded-xl border text-xs font-bold transition-all ${
                      severity === level ? `${color} ring-1 ring-white/30` : 'border-slate-800 bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Node */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Strategic Logistics Node / Sector
              </label>
              <select
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
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
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Auto-Captured GPS Location
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    gpsStatus === 'locked'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                      : gpsStatus === 'acquiring'
                      ? 'bg-blue-950 border border-blue-600 text-blue-300 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {gpsStatus === 'locked' ? 'GPS Locked' : gpsStatus === 'acquiring' ? 'Satellite Lock...' : 'Sensor Ready'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={captureGps}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${gpsStatus === 'acquiring' ? 'animate-spin' : ''}`} />
                  Re-acquire
                </button>
                <button
                  type="button"
                  onClick={() => setManualGps(!manualGps)}
                  className="text-xs text-red-400 hover:underline font-medium"
                >
                  {manualGps ? 'Use Sensor' : 'Manual Edit'}
                </button>
              </div>
            </div>

            {!manualGps ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Latitude</span>
                  <span className="font-mono font-bold text-white">
                    {gpsLocation?.latitude ? gpsLocation.latitude.toFixed(5) + '° N' : 'Acquiring...'}
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Longitude</span>
                  <span className="font-mono font-bold text-white">
                    {gpsLocation?.longitude ? gpsLocation.longitude.toFixed(5) + '° E' : 'Acquiring...'}
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Precision Accuracy</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ±{Math.round(gpsLocation?.accuracy || 15)} meters
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Manual Latitude</label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                    placeholder="25.1234"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Manual Longitude</label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                    placeholder="92.3456"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timestamp & Operator Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center space-x-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Incident Timestamp</span>
                <span className="font-mono font-bold text-slate-200">
                  {new Date(timestamp).toLocaleDateString('en-IN', { dateStyle: 'medium' })}{' '}
                  {new Date(timestamp).toLocaleTimeString('en-IN', { hour12: false })} IST
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center space-x-3">
              <PhoneCall className="w-4 h-4 text-red-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Emergency Dispatch Target</span>
                <span className="font-mono font-bold text-slate-200">
                  NDMA / MDoNER Strategic Cell (+91 98765 43210)
                </span>
              </div>
            </div>
          </div>

          {/* Optional Field Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Field Situational Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., 20+ POL tankers stranded near Sonapur tunnel entrance; road surface cracked; local BRO excavator unit en route..."
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl p-3 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitStatus === 'sending'}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wide uppercase shadow-xl hover:shadow-red-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {submitStatus === 'sending' ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Transmitting Emergency SOS...</span>
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
          <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Local Device Queue ({pendingAlerts.length} Pending Alert{pendingAlerts.length > 1 ? 's' : ''})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleFlushQueue}
                disabled={!isOnline || isFlushing}
                className="text-xs font-bold text-amber-400 hover:text-amber-200 disabled:opacity-30 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
                Force Sync Now
              </button>
            </div>

            <div className="space-y-2">
              {pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{alert.disruptionType}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Node: {alert.nodeName}</span>
                      <span>•</span>
                      <span>Queued: {new Date(alert.queuedAt).toLocaleTimeString('en-IN')}</span>
                      {alert.retryCount > 0 && (
                        <span className="text-amber-400">({alert.retryCount} attempts)</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await removePendingSosAlert(alert.id);
                      refreshPendingQueue();
                    }}
                    className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded"
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
    </div>
  );
}
