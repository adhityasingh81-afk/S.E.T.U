import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  MessageSquareText,
  LayoutDashboard,
  Network,
  Flame,
  Compass,
  MessageSquareCode,
  GitCompare,
  SlidersHorizontal,
  Factory,
  Warehouse,
  CornerDownLeft,
  Camera,
  User as UserIcon,
  Edit3,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { CRISIS_SCENARIOS } from '../../data/scenariosData';
import { NODES } from '../../data/auraSupplyChainData';
import { ProfileSettingsModal } from '../profile/ProfileSettingsModal';
import { voiceService } from '../../engine/voiceService';
import { notificationService } from '../../services/notificationService';

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
  onUpdateUser,
  onLogout,
  onNavigateToTab,
  onNavigateSos,
  backendOnline = true
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => voiceService.isEnabled());

  // Listen for external / system-wide voice state changes
  useEffect(() => {
    return voiceService.subscribe((enabled) => {
      setIsVoiceEnabled(enabled);
    });
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click Outside to Close Search Drawer
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification items & Supplier Messages synchronized with centralized notificationService
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());
  const [messages, setMessages] = useState(() => notificationService.getMessages());

  // Subscribe to real-time additions (e.g. SOS dispatches and field alerts)
  useEffect(() => {
    return notificationService.subscribe(({ notifications: nextNotifs, messages: nextMsgs }) => {
      setNotifications(nextNotifs);
      setMessages(nextMsgs);
    });
  }, []);

  // Search Items Registry with all features, actions, scenarios, and hubs
  const searchItems = useMemo(() => {
    const items = [
      // 1. MAIN FEATURES & PAGES
      {
        id: 'feat-command-center',
        title: 'Command Center',
        subtitle: 'Executive overview, real-time alerts, resilience score & revenue risk',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'Dashboard',
        icon: LayoutDashboard,
        keywords: ['command', 'center', 'dashboard', 'home', 'overview', 'metrics', 'kpi', 'health', 'resilience', 'score', 'risk'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('command-center');
        }
      },
      {
        id: 'feat-digital-twin',
        title: 'Digital Twin & Global Network',
        subtitle: 'Interactive 3D geo-topology map, 15 operational hubs, multi-tier visibility',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'Digital Twin',
        icon: Network,
        keywords: ['digital', 'twin', 'map', 'topology', 'globe', 'suppliers', 'factories', 'warehouses', 'network', 'routes', 'hubs', 'geo'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('digital-twin');
        }
      },
      {
        id: 'feat-fracture-mode',
        title: 'Fracture Mode Simulator',
        subtitle: 'Cascade ripple engine, blast radius analysis & stress testing',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'Simulation',
        icon: Flame,
        keywords: ['fracture', 'mode', 'simulator', 'stress', 'test', 'cascade', 'ripple', 'blast', 'radius', 'shock', 'disruption', 'failure'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('fracture-mode');
        }
      },
      {
        id: 'feat-recovery-cockpit',
        title: 'Autonomous Recovery Cockpit',
        subtitle: 'Multi-strategy reroute optimizer, Pareto frontier & mitigation execution',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'AI Engine',
        icon: Compass,
        keywords: ['recovery', 'cockpit', 'strategies', 'optimizer', 'pareto', 'reroute', 'mitigation', 'autonomous', 'speed', 'cost'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('recovery-cockpit');
        }
      },
      {
        id: 'feat-negotiation-room',
        title: 'AI Supplier Negotiation Room',
        subtitle: 'Multi-agent dynamic bargaining, discount concessions & contract term sheets',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'AI Engine',
        icon: MessageSquareCode,
        keywords: ['negotiation', 'room', 'supplier', 'bargaining', 'kyoto', 'contract', 'term sheet', 'concession', 'discount', 'agent', 'chat'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('negotiation-room');
        }
      },
      {
        id: 'feat-counterfactual',
        title: 'Counterfactual & ROI Analysis',
        subtitle: 'What-if financial comparison, ROI variance & net value preserved',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'Analytics',
        icon: GitCompare,
        keywords: ['counterfactual', 'roi', 'what if', 'financial', 'comparison', 'loss', 'variance', 'capital', 'value', 'analysis'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('counterfactual');
        }
      },
      {
        id: 'feat-resilience-planner',
        title: 'Resilience Capital Planner',
        subtitle: 'Strategic buffer sizing, dual-sourcing investment & multi-tier modeling',
        category: 'features',
        categoryLabel: 'Core Views',
        badge: 'Analytics',
        icon: SlidersHorizontal,
        keywords: ['resilience', 'planner', 'capital', 'buffer', 'dual sourcing', 'inventory', 'investment', 'sizing', 'budget'],
        action: () => {
          if (onNavigateToTab) onNavigateToTab('resilience-planner');
        }
      },

      // 2. SYSTEM ACTIONS & REPORTS
      {
        id: 'act-executive-report',
        title: 'Executive Crisis Briefing (PDF Report)',
        subtitle: 'Generate C-suite crisis audit, recovery plan summary & PDF export',
        category: 'actions',
        categoryLabel: 'Actions & Reports',
        badge: 'Report',
        icon: FileText,
        keywords: ['report', 'brief', 'executive', 'briefing', 'pdf', 'export', 'audit', 'summary', 'board'],
        action: () => {
          if (onOpenReport) onOpenReport();
        }
      },
      {
        id: 'act-reset-nominal',
        title: 'Reset Network to Baseline Nominal',
        subtitle: 'Clear active disruptions and restore all 15 operational nodes',
        category: 'actions',
        categoryLabel: 'Actions & Reports',
        badge: 'System Action',
        icon: RefreshCw,
        keywords: ['reset', 'nominal', 'clear', 'disruption', 'baseline', 'restore', 'normal'],
        action: () => {
          if (onResetNetwork) onResetNetwork();
        }
      },

      // 3. CRISIS SCENARIOS
      ...CRISIS_SCENARIOS.map((sc) => ({
        id: `sc-${sc.id}`,
        title: sc.title,
        subtitle: `${sc.badge} • ${sc.description}`,
        category: 'scenarios',
        categoryLabel: 'Crisis Scenarios',
        badge: `⚡ ${sc.severityPct}% Impact`,
        icon: Zap,
        keywords: ['scenario', 'crisis', 'disruption', 'shock', sc.title.toLowerCase(), sc.affectedNodeName.toLowerCase(), sc.eventType.toLowerCase(), sc.geographicRegion.toLowerCase()],
        action: () => {
          if (onSelectScenario) onSelectScenario(sc);
          if (onNavigateToTab) onNavigateToTab('command-center');
        }
      })),

      // 4. SUPPLY CHAIN NODES & ENTITIES
      ...NODES.map((node) => ({
        id: `node-${node.id}`,
        title: node.name,
        subtitle: `${node.location} • ${node.category} (${node.criticality})`,
        category: 'network',
        categoryLabel: 'Supply Network Nodes',
        badge: node.type === 'supplier' ? `Tier-${node.tier || 1} Supplier` : node.type === 'factory' ? 'Manufacturing Plant' : 'Logistics Hub',
        icon: node.type === 'supplier' ? Building2 : node.type === 'factory' ? Factory : Warehouse,
        keywords: ['node', 'hub', 'supplier', 'factory', 'warehouse', node.name.toLowerCase(), node.location.toLowerCase(), node.category.toLowerCase(), node.region.toLowerCase()],
        action: () => {
          if (node.id === 'sup-kyoto-ceramic' && onNavigateToTab) {
            onNavigateToTab('negotiation-room');
          } else if (onNavigateToTab) {
            onNavigateToTab('digital-twin');
          }
        }
      }))
    ];

    return items;
  }, [onNavigateToTab, onSelectScenario, onOpenReport, onResetNetwork]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    let list = searchItems;

    // Filter by Category Tab if set
    if (selectedCategoryFilter !== 'all') {
      list = list.filter(item => item.category === selectedCategoryFilter);
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      // If query is empty, show all items under active filter
      return list;
    }

    const terms = query.split(/\s+/);
    return list.filter(item => {
      const targetStr = `${item.title} ${item.subtitle} ${item.badge} ${item.categoryLabel} ${item.keywords.join(' ')}`.toLowerCase();
      return terms.every(term => targetStr.includes(term));
    });
  }, [searchItems, searchQuery, selectedCategoryFilter]);

  // Reset selected index on query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedCategoryFilter]);

  // Handle Item Execution
  const handleExecuteItem = (item) => {
    if (item && item.action) {
      item.action();
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Keyboard navigation within search results
  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredResults.length || 1)) % (filteredResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        handleExecuteItem(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      if (searchInputRef.current) searchInputRef.current.blur();
    }
  };

  const user = currentUser || {
    name: 'Austin Robertson',
    role: 'Chief Supply Chain Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    clearance: 'Tier-1 Command'
  };

  const unreadNotifCount = notifications.filter(n => n.unread).length;
  const unreadMsgCount = messages.filter(m => m.unread).length;

  const markAllNotifsRead = () => {
    notificationService.markAllNotifsRead();
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markAllMessagesRead = () => {
    notificationService.markAllMessagesRead();
    setMessages(prev => prev.map(m => ({ ...m, unread: false })));
  };

  const handleNotificationClick = (notif) => {
    notificationService.markNotifRead(notif.id);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setIsNotificationsOpen(false);
    if (notif.actionTab === 'sos' && onNavigateSos) {
      onNavigateSos();
    } else if (onNavigateToTab && notif.actionTab) {
      onNavigateToTab(notif.actionTab);
    }
  };

  const handleMessageClick = (msg) => {
    notificationService.markMessageRead(msg.id);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
    setIsMessagesOpen(false);
    if (msg.actionTab === 'sos' && onNavigateSos) {
      onNavigateSos();
    } else if (onNavigateToTab && msg.actionTab) {
      onNavigateToTab(msg.actionTab);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4 shadow-sm">
      {/* Left: Interactive Global Command Search Bar & Palette (Enlarged & High Visibility) */}
      <div ref={searchContainerRef} className="flex items-center gap-3 flex-1 min-w-[260px] max-w-2xl relative">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search corridors, mountain passes, depots, district stockpiles... (⌘K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              setIsSearchOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-white border-2 border-slate-200/90 rounded-full pl-10 pr-16 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm caret-brand-600"
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* ================= COMMAND PALETTE DROPDOWN DRAWER ================= */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[340px] sm:min-w-[500px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
            {/* Filter Tabs Header */}
            <div className="p-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'features', label: '🚀 Features & Views' },
                  { id: 'scenarios', label: '⚡ Scenarios' },
                  { id: 'network', label: '🏭 Supply Hubs' },
                  { id: 'actions', label: '🛠️ Actions' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                      selectedCategoryFilter === tab.id
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleExecuteItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? 'bg-orange-50/80 border border-brand-200/60 shadow-sm'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold font-sans truncate ${
                              isSelected ? 'text-brand-900' : 'text-slate-900'
                            }`}>
                              {item.title}
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <span className={`text-[10px] font-bold flex items-center gap-1 transition-opacity ${
                          isSelected ? 'text-brand-600 opacity-100' : 'opacity-0 text-slate-400'
                        }`}>
                          <span>Jump</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty Results State */
                <div className="p-6 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">No matching features or entities found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try searching for key platform modules or hubs</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    {['Recovery', 'Digital Twin', 'Taiwan 40%', 'Negotiation', 'ROI', 'Report'].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => {
                          setSearchQuery(hint);
                          if (searchInputRef.current) searchInputRef.current.focus();
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-brand-600 text-slate-600 transition-colors"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Command Palette Keyboard Hints Footer */}
            <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded font-mono text-[9px]">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded font-mono text-[9px]">↵</kbd> to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded font-mono text-[9px]">ESC</kbd> to close
                </span>
              </div>
              <span className="text-brand-600 font-semibold">Nexus Command Search</span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Compact Live Disruption / Recovery Status Indicator */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {/* Backend API Server Status Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
            backendOnline 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={backendOnline ? "Node.js Express Server Live on port 5000" : "Running in client-side resilience mode"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0`}></span>
          <span className="font-mono">{backendOnline ? 'API:5000 Live' : 'API:Offline'}</span>
        </div>

        {/* Compact Disruption Status Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
            isDisrupted && !activeStrategy
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : activeStrategy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
          title={isDisrupted && !activeStrategy ? (activeScenario?.title || 'Fracture Active') : activeStrategy ? activeStrategy.title : 'All 15 Hubs Nominal'}
        >
          {isDisrupted && !activeStrategy ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-[120px]">Fracture Active</span>
            </>
          ) : activeStrategy ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[120px]">Recovery Active</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Nominal</span>
            </>
          )}
        </div>

        {/* Compact Quick Crisis Scenario Dropdown */}
        <div className="flex items-center gap-1 bg-[#f8fafc] border border-slate-200 rounded-full px-2.5 py-1 text-[11px]">
          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
          <select
            value={activeScenario?.id || ""}
            onChange={(e) => {
              const sc = CRISIS_SCENARIOS.find(s => s.id === e.target.value);
              if (sc) onSelectScenario(sc);
            }}
            className="bg-transparent text-slate-700 font-semibold text-[11px] focus:outline-none cursor-pointer pr-1 max-w-[115px] truncate"
            title="Trigger Crisis Scenario"
          >
            <option value="" disabled className="text-slate-400">
              ⚡ Scenario...
            </option>
            {CRISIS_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id} className="text-slate-800">
                {scenario.badge || scenario.title}
              </option>
            ))}
          </select>
        </div>

        {isDisrupted && (
          <button
            onClick={onResetNetwork}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
            title="Reset to baseline nominal"
          >
            <RefreshCw className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right: Voice Toggle, Notifications, Messages, Profile & Executive Briefing */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* ================= GLOBAL SYSTEM-WIDE VOICE MODE TOGGLE BUTTON ================= */}
        <button
          onClick={() => {
            const next = voiceService.toggle();
            setIsVoiceEnabled(next);
          }}
          className={`relative p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
            isVoiceEnabled
              ? 'text-brand-600 bg-orange-50 hover:bg-orange-100 hover:text-brand-700'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title={isVoiceEnabled ? 'Voice Mode: Active (Click to turn off voice mode system-wide)' : 'Voice Mode: Muted (Click to turn on voice mode)'}
          aria-label={isVoiceEnabled ? 'Turn off voice mode' : 'Turn on voice mode'}
        >
          {isVoiceEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

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
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 font-sans">Crisis Alerts</span>
                  {unreadNotifCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
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
                      notif.isSos
                        ? notif.unread
                          ? 'bg-red-50/90 border-red-300 hover:bg-red-50 shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                        : notif.unread
                        ? 'bg-orange-50/40 border-brand-200 hover:bg-orange-50/70'
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
                        <span className="truncate">{notif.title}</span>
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
                      <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                        {notif.actionLabel || (notif.isSos ? 'View SOS Alert' : 'View Details')}
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
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-fade-in-up">
              {/* Clickable Profile Card Banner */}
              <div 
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsProfileOpen(false);
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-orange-50/70 to-amber-50/40 border border-orange-200/70 cursor-pointer hover:border-brand-400 hover:shadow-sm transition-all group"
                title="Click to edit profile and photo"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40 group-hover:ring-brand-500 transition-all"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand-500 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-white">
                        ✎
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 font-sans group-hover:text-brand-700 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-[10.5px] text-slate-500 truncate max-w-[140px]">
                        {user.email || 'operator@auradevices.io'}
                      </div>
                      <div className="text-[9.5px] text-brand-600 font-extrabold mt-0.5 uppercase tracking-wider font-mono">
                        {user.clearance || 'Tier-1 Clearance'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs group-hover:bg-brand-500 group-hover:text-white transition-all">
                    Edit
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-1 border-t border-slate-100 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-brand-700 font-bold transition-colors cursor-pointer text-left"
                >
                  <Camera className="w-4 h-4 text-brand-500" />
                  <span>Change Photo & Profile Info</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer text-left"
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

        {/* Field Emergency SOS Quick Trigger */}
        <button
          onClick={() => onNavigateSos && onNavigateSos()}
          className="px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-500/80 hover:shadow-md hover:shadow-red-500/25"
          title="Launch Field SOS & Offline Emergency Alert System"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>SOS ALERT</span>
        </button>
      </div>

      {/* User Profile & Photo Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={onUpdateUser}
      />
    </header>
  );
}
