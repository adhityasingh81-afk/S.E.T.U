import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Sparkles,
  Shield,
  ArrowRight,
  Radio,
  ExternalLink,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  X
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export function NotificationCenterBell({
  onNavigateToTab,
  onNavigateSos,
  align = 'right',
  onNotificationSelected = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());
  const [selectedSosAlert, setSelectedSosAlert] = useState(null);
  const containerRef = useRef(null);

  // Subscribe to real-time notification changes (from SOS submissions, queue flushes, etc.)
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(({ notifications: nextNotifs }) => {
      setNotifications(nextNotifs);
    });
    return unsubscribe;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    notificationService.markAllNotifsRead();
  };

  const handleItemClick = (notif) => {
    notificationService.markNotifRead(notif.id);
    if (notif.isSos) {
      setSelectedSosAlert(notif);
      if (onNotificationSelected) onNotificationSelected(notif);
    } else {
      setIsOpen(false);
      if (notif.actionTab === 'sos' && onNavigateSos) {
        onNavigateSos();
      } else if (onNavigateToTab && notif.actionTab) {
        onNavigateToTab(notif.actionTab);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        title="Crisis Alerts & SOS Field Telemetry Notification Center"
        aria-label="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 font-sans">Notification Center</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {unreadCount} New
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark all read</span>
            </button>
          </div>

          {/* List of Notifications */}
          <div className="space-y-2 max-h-84 overflow-y-auto pr-0.5">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No crisis notifications at this time
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all ${
                    notif.isSos
                      ? notif.unread
                        ? 'bg-red-50/80 border-red-200 hover:bg-red-50 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                      : notif.unread
                      ? 'bg-orange-50/60 border-brand-200 hover:bg-orange-50/90'
                      : 'bg-[#f8fafc] border-slate-200/70 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 font-sans min-w-0">
                      {notif.isSos ? (
                        <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Radio className="w-3 h-3 animate-pulse" />
                        </div>
                      ) : notif.type === 'crisis' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      ) : notif.type === 'negotiation' ? (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="truncate font-sans font-bold">{notif.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.time}</span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                    {notif.desc}
                  </p>

                  {/* SOS Special Badges */}
                  {notif.isSos && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">
                        {notif.status === 'dispatched' ? 'GATEWAY CONFIRMED ✅' : 'OFFLINE QUEUED ⏳'}
                      </span>
                      {notif.smsSid && (
                        <span className="text-[9px] font-mono text-slate-500">
                          Ref: {notif.smsSid}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <span className="text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                      {notif.actionLabel || (notif.isSos ? 'Inspect Telemetry' : 'View Details')}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Detail Modal for SOS Alert when clicked from Notification Center */}
      {selectedSosAlert && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    SOS Emergency Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dispatched to NDMA / MDoNER Emergency Response Desk
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSosAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-red-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900">{selectedSosAlert.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-red-200/80 rounded font-bold">
                    {selectedSosAlert.status === 'dispatched' ? 'GATEWAY DELIVERED' : 'SAVED OFFLINE'}
                  </span>
                </div>
                <p className="text-[11px] text-red-800">
                  {selectedSosAlert.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sector / Location</span>
                  <span className="font-semibold text-slate-900">{selectedSosAlert.nodeName || 'Field Corridor'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Dispatched Time</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedSosAlert.time}</span>
                </div>
              </div>

              {selectedSosAlert.coordinates && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>
                      {selectedSosAlert.coordinates.latitude?.toFixed(4)}° N, {selectedSosAlert.coordinates.longitude?.toFixed(4)}° E
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">GPS LOCKED</span>
                </div>
              )}

              {selectedSosAlert.smsSid && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <span>Emergency SMS Gateway Ref</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedSosAlert.smsSid}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedSosAlert(null);
                  setIsOpen(false);
                  if (onNavigateSos) onNavigateSos();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Go to SOS Console
              </button>
              <button
                type="button"
                onClick={() => setSelectedSosAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
