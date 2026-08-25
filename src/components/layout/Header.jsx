import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Mail, 
  ChevronDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  Activity, 
  Globe, 
  LogOut, 
  UserCheck, 
  Building2,
  X,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCheck,
  MessageSquareText
} from 'lucide-react';
import { CRISIS_SCENARIOS } from '../../data/scenariosData';

export function Header({
  activeScenario,
  onSelectScenario,
  isDisrupted,
  onResetNetwork,
  activePersona,
  onChangePersona,
  onOpenReport,
  activeStrategy,
  currentUser,
  onLogout,
  onNavigateToTab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notification items state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Active Fracture Detected: Taiwan Micro Foundry',
      desc: '40% throughput degradation in Hsinchu corridor. Chennai assembly runway down to 9 days.',
      time: '2m ago',
      type: 'crisis',
      unread: true,
      actionTab: 'fracture-mode',
      actionLabel: 'View Cascade Ripple'
    },
    {
      id: 'notif-2',
      title: 'Kyoto Advanced Ceramics Concession Offer',
      desc: 'Supplier agreed to expedite 40,000 IC chips with 6% volume discount via Air Freight.',
      time: '14m ago',
      type: 'negotiation',
      unread: true,
      actionTab: 'negotiation-room',
      actionLabel: 'Open Negotiation Room'
    },
    {
      id: 'notif-3',
      title: 'Autonomous Reroute Protocol Ready',
      desc: 'Strategy C (Resilience-Optimized) computed +₹12.5 Cr net value preservation.',
      time: '35m ago',
      type: 'recovery',
      unread: false,
      actionTab: 'recovery-cockpit',
      actionLabel: 'Inspect Strategy'
    },
  ]);

  // Supplier Inquiries / Messages state
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'Kenji Sato (VP Sales, Kyoto Ceramics)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      subject: 'Emergency IC Substrate Allocation Confirmed',
      preview: 'We have reserved Batch #KY-9921 for AURA Devices. Ready to dispatch via Tokyo-Narita express.',
      time: '10:14 AM',
      unread: true,
      actionTab: 'negotiation-room',
    },
    {
      id: 'msg-2',
      sender: 'Marcus Vance (Logistics Director, DHL Global)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      subject: 'Air Freight Cargo Route TSMC -> Chennai',
      preview: 'Charter slot confirmed for 48-hour transit window. Awaiting final procurement sign-off.',
      time: '09:45 AM',
      unread: true,
      actionTab: 'recovery-cockpit',
    },
    {
      id: 'msg-3',
      sender: 'Dr. Cheryl Ng (Singapore Regional Gateway)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      subject: 'Buffer Inventory Stockpile Audit',
      preview: 'Singapore gateway warehouse inventory at 14 days runway. All regional fulfillment lines clear.',
      time: '08:20 AM',
      unread: false,
      actionTab: 'digital-twin',
    },
  ]);

  const user = currentUser || {
    name: 'Austin Robertson',
    role: 'Chief Supply Chain Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    clearance: 'Tier-1 Command'
  };

  const unreadNotifCount = notifications.filter(n => n.unread).length;
  const unreadMsgCount = messages.filter(m => m.unread).length;

  const markAllNotifsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAllMessagesRead = () => {
    setMessages(messages.map(m => ({ ...m, unread: false })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setIsNotificationsOpen(false);
    if (onNavigateToTab && notif.actionTab) {
      onNavigateToTab(notif.actionTab);
    }
  };

  const handleMessageClick = (msg) => {
    setMessages(messages.map(m => m.id === msg.id ? { ...m, unread: false } : m));
    setIsMessagesOpen(false);
    if (onNavigateToTab && msg.actionTab) {
      onNavigateToTab(msg.actionTab);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
      {/* Left: Search Bar with Interactive Results Drawer */}
      <div className="flex items-center gap-4 flex-1 max-w-md relative">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers, materials, hubs, SKUs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) setIsSearchOpen(true);
            }}
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Quick-Jump Popover */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-fade-in-up">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Matching Global Hubs & Entities
            </div>
            <div className="space-y-1 text-xs">
              <div 
                onClick={() => {
                  setIsSearchOpen(false);
                  if (onNavigateToTab) onNavigateToTab('digital-twin');
                }}
                className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-600">Taiwan Micro Foundry (TSMC)</div>
                  <div className="text-[10px] text-slate-500">Tier-1 Silicon • Hsinchu, Taiwan</div>
                </div>
                <span className="text-[10px] text-brand-600 font-bold">Open Twin →</span>
              </div>

              <div 
                onClick={() => {
                  setIsSearchOpen(false);
                  if (onNavigateToTab) onNavigateToTab('digital-twin');
                }}
                className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-600">Chennai Mega Assembly Hub</div>
                  <div className="text-[10px] text-slate-500">Primary Assembly Plant • Chennai, India</div>
                </div>
                <span className="text-[10px] text-brand-600 font-bold">Open Twin →</span>
              </div>

              <div 
                onClick={() => {
                  setIsSearchOpen(false);
                  if (onNavigateToTab) onNavigateToTab('negotiation-room');
                }}
                className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-600">Kyoto Advanced Ceramics</div>
                  <div className="text-[10px] text-slate-500">Substrate Supplier • Kyoto, Japan</div>
                </div>
                <span className="text-[10px] text-brand-600 font-bold">Negotiate →</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Live Disruption / Recovery Status Indicator */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Disruption status pill */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          isDisrupted && !activeStrategy
            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            : activeStrategy
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isDisrupted && !activeStrategy ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Fracture Active: {activeScenario ? activeScenario.title.split('(')[0] : 'Taiwan 40% Drop'}</span>
            </>
          ) : activeStrategy ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recovery Active: {activeStrategy.name} ({activeStrategy.title})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Network Nominal (15 Hubs Online)</span>
            </>
          )}
        </div>

        {/* Quick Crisis Scenario Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200 rounded-full px-3 py-1 text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={activeScenario?.id || ""}
            onChange={(e) => {
              const sc = CRISIS_SCENARIOS.find(s => s.id === e.target.value);
              if (sc) onSelectScenario(sc);
            }}
            className="bg-transparent text-slate-700 font-medium text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="" disabled className="text-slate-400">
              ⚡ Trigger Scenario...
            </option>
            {CRISIS_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id} className="text-slate-800">
                {scenario.title}
              </option>
            ))}
          </select>
        </div>

        {isDisrupted && (
          <button
            onClick={onResetNetwork}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            title="Reset to baseline nominal"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right: Notifications, Messages, Profile & Executive Briefing */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        
        {/* ================= NOTIFICATION BELL BUTTON & DROPDOWN ================= */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsMessagesOpen(false);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications & Crisis Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 font-sans">Crisis Alerts</span>
                  {unreadNotifCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-brand-700">
                      {unreadNotifCount} New
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotifsRead}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all ${
                      notif.unread
                        ? 'bg-orange-50/40 border-brand-200 hover:bg-orange-50/70'
                        : 'bg-[#f8fafc] border-slate-200/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 font-sans">
                        {notif.type === 'crisis' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : notif.type === 'negotiation' ? (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate">{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.time}</span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                      {notif.desc}
                    </p>

                    <div className="flex justify-end pt-1">
                      <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                        {notif.actionLabel}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= MESSAGES / INQUIRIES BUTTON & DROPDOWN ================= */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsMessagesOpen(!isMessagesOpen);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Supplier Communications & Negotiation Feed"
          >
            <Mail className="w-4 h-4" />
            {unreadMsgCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500 text-white leading-tight">
                {unreadMsgCount}
              </span>
            )}
          </button>

          {/* Messages Dropdown Panel */}
          {isMessagesOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 font-sans">Supplier Messages</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Live Telemetry
                  </span>
                </div>
                <button
                  onClick={markAllMessagesRead}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg)}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all ${
                      msg.unread
                        ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50/70'
                        : 'bg-[#f8fafc] border-slate-200/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={msg.avatar}
                          alt={msg.sender}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <span className="font-bold text-slate-900 font-sans truncate">{msg.sender.split('(')[0]}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{msg.time}</span>
                    </div>

                    <div className="font-bold text-slate-800 text-[11px]">{msg.subject}</div>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium line-clamp-2">
                      {msg.preview}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsMessagesOpen(false);
                    if (onNavigateToTab) onNavigateToTab('negotiation-room');
                  }}
                  className="w-full btn-orange-pill py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  <span>Launch AI Negotiation Room</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-0.5"></div>

        {/* ================= USER PROFILE DROPDOWN ================= */}
        <div className="relative">
          <div 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
              setIsMessagesOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1 cursor-pointer select-none group"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30 shadow-sm group-hover:ring-brand-500 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                {user.name}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{user.role.split('(')[0]}</div>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-fade-in-up">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user.name}</div>
                <div className="text-[11px] text-slate-500">{user.email || 'austin.robertson@auradevices.io'}</div>
                <div className="text-[10px] text-brand-600 font-bold mt-1 uppercase tracking-wider">{user.clearance || 'Tier-1 Clearance'}</div>
              </div>

              <div className="pt-1 border-t border-slate-100 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Station</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Executive Brief Button */}
        <button
          onClick={onOpenReport}
          className="btn-orange-pill px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Executive Brief</span>
        </button>
      </div>
    </header>
  );
}
