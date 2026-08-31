import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingDown, 
  Building2, 
  User, 
  Play, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck,
  Check,
  ChevronRight,
  X,
  AlertTriangle,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FastForward,
  Award
} from 'lucide-react';
import { NEGOTIATION_SUPPLIERS, getSupplierNegotiation } from '../../engine/negotiationEngine';
import { nexusApi } from '../../api/nexusApi';

export function NegotiationRoom({ onSignTermSheet }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup-phoenix-semi');
  const [activeNegotiation, setActiveNegotiation] = useState(() => getSupplierNegotiation('sup-phoenix-semi'));
  
  // Multi-round dialogue states
  const [dialogueMessages, setDialogueMessages] = useState(() => {
    const neg = getSupplierNegotiation('sup-phoenix-semi');
    return neg.dialogueRounds ? [...neg.dialogueRounds[0]] : [...neg.dialogueScript];
  });
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(1);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(() => getSupplierNegotiation('sup-phoenix-semi').negotiatedOffer);
  
  const [customOfferText, setCustomOfferText] = useState('');
  const [showTermSheet, setShowTermSheet] = useState(false);
  const [generatedMOU, setGeneratedMOU] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isNegotiatingRound, setIsNegotiatingRound] = useState(false);

  // Decision state: null | 'approved' | 'disapproved' | 'negotiating'
  const [decisionStatus, setDecisionStatus] = useState(null);

  // Toast notification state: null | { type: 'success' | 'danger' | 'info', title: string, message: string }
  const [popupToast, setPopupToast] = useState(null);

  const chatBottomRef = useRef(null);

  // Reset when supplier changes
  useEffect(() => {
    const neg = getSupplierNegotiation(selectedSupplierId);
    setActiveNegotiation(neg);
    const initialMsgs = neg.dialogueRounds ? [...neg.dialogueRounds[0]] : [...neg.dialogueScript];
    setDialogueMessages(initialMsgs);
    setVisibleMessagesCount(1);
    setCurrentRoundIndex(0);
    setCurrentOffer(neg.negotiatedOffer);
    setDecisionStatus(null);
    setIsSigned(false);
    setGeneratedMOU(null);
    setPopupToast(null);
    setIsAutoPlaying(false);
  }, [selectedSupplierId]);

  // Auto-scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialogueMessages, visibleMessagesCount, decisionStatus, isNegotiatingRound]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (popupToast) {
      const timer = setTimeout(() => setPopupToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [popupToast]);

  const handleNextMessage = () => {
    if (visibleMessagesCount < dialogueMessages.length) {
      setVisibleMessagesCount(prev => prev + 1);
    }
  };

  const handleAutoPlay = () => {
    setIsAutoPlaying(true);
    let count = visibleMessagesCount;
    const interval = setInterval(() => {
      if (count < dialogueMessages.length) {
        count++;
        setVisibleMessagesCount(count);
      } else {
        clearInterval(interval);
        setIsAutoPlaying(false);
      }
    }, 800);
  };

  const handleStartFullNegotiation = () => {
    setIsAutoPlaying(true);
    let count = visibleMessagesCount;
    const interval = setInterval(() => {
      if (count < dialogueMessages.length) {
        count++;
        setVisibleMessagesCount(count);
      } else {
        clearInterval(interval);
        setIsAutoPlaying(false);
      }
    }, 700);
  };

  // 1. APPROVE ACTION
  const handleApprove = () => {
    setDecisionStatus('approved');
    setPopupToast({
      type: 'success',
      title: 'Consensus finalised',
      message: `Commercial terms with ${activeNegotiation.name} locked at ₹${currentOffer.unitPriceINR}/unit with ${currentOffer.leadTimeDays}-day delivery. Ready for binding MOU signature.`
    });
  };

  // 2. DISAPPROVE ACTION
  const handleDisapprove = () => {
    setDecisionStatus('disapproved');
    setPopupToast({
      type: 'danger',
      title: 'Strategy disapproved',
      message: `Current supplier counter-proposal was rejected. You can negotiate further to demand deeper concessions or switch to another alternative supplier.`
    });
  };

  // 3. NEGOTIATE FURTHER ACTION
  const handleNegotiateFurther = () => {
    setIsNegotiatingRound(true);
    setDecisionStatus('negotiating');
    setPopupToast({
      type: 'info',
      title: 'Executing Deeper Negotiation Round',
      message: `NEXUS Agent is applying algorithmic bargaining leverage for lower unit costs and zero surcharges...`
    });

    const nextRound = currentRoundIndex + 1;

    setTimeout(() => {
      let newMessages = [];
      let updatedOffer = { ...currentOffer };

      if (activeNegotiation.dialogueRounds && nextRound < activeNegotiation.dialogueRounds.length) {
        // Pre-scripted high-fidelity round
        newMessages = [...activeNegotiation.dialogueRounds[nextRound]];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg?.offerUpdate) {
          updatedOffer = { ...lastMsg.offerUpdate };
        }
      } else {
        // Dynamic continuous bargaining round
        const roundNum = nextRound + 1;
        const furtherDiscount = Math.round(currentOffer.unitPriceINR * 0.985);
        const furtherSavings = Math.round((currentOffer.estimatedCostSavingsCr + 0.25) * 100) / 100;
        
        newMessages = [
          {
            id: `msg-dynamic-agent-${Date.now()}`,
            round: roundNum,
            speaker: 'nexus-agent',
            speakerName: 'NEXUS Autonomous Procurement Agent',
            avatar: 'NX',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `${activeNegotiation.repName.split(' ')[0]}, we are close to consensus, but our procurement benchmarks require a unit price of ₹${furtherDiscount} and 100% absorption of freight demurrage to authorize immediate execution.`,
            tag: `Round ${roundNum} High-Stakes Counter`,
            metrics: { targetPrice: `₹${furtherDiscount}`, freight: '100% Absorbed' },
          },
          {
            id: `msg-dynamic-supplier-${Date.now() + 1}`,
            round: roundNum,
            speaker: 'supplier',
            speakerName: `${activeNegotiation.repName} (${activeNegotiation.name})`,
            avatar: activeNegotiation.repAvatar,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `Understood. After internal review with executive manufacturing control, ${activeNegotiation.name} agrees to adjust unit price to ₹${furtherDiscount}, waive all demurrage fees, and maintain express 3-day delivery.`,
            tag: `Round ${roundNum} Concession Accepted`,
            metrics: { price: `₹${furtherDiscount}`, leadTime: `${currentOffer.leadTimeDays} Days`, savings: `₹${furtherSavings} Cr` },
          },
          {
            id: `msg-dynamic-summary-${Date.now() + 2}`,
            round: roundNum,
            speaker: 'nexus-agent',
            speakerName: 'NEXUS Autonomous Procurement Agent',
            avatar: 'NX',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `Round ${roundNum} terms evaluated: Net savings increased to ₹${furtherSavings} Cr! Cost and delivery parameters optimized. Awaiting executive approval.`,
            tag: `Round ${roundNum} Completed`,
            metrics: { status: 'DEEPER SAVINGS', totalSavings: `₹${furtherSavings} Cr` },
          }
        ];

        updatedOffer = {
          ...currentOffer,
          unitPriceINR: furtherDiscount,
          rushSurchargePct: 0,
          estimatedCostSavingsCr: furtherSavings,
        };
      }

      const newTotal = dialogueMessages.length + newMessages.length;
      setDialogueMessages(prev => [...prev, ...newMessages]);
      setVisibleMessagesCount(newTotal);
      setCurrentRoundIndex(nextRound);
      setCurrentOffer(updatedOffer);
      setIsNegotiatingRound(false);
      setDecisionStatus(null);
    }, 1000);
  };

  // Custom User Input Proposal
  const handleSendCustomOffer = (e) => {
    e.preventDefault();
    if (!customOfferText.trim()) return;

    const userText = customOfferText;
    setCustomOfferText('');

    const newMsg = {
      id: `msg-custom-${Date.now()}`,
      speaker: 'nexus-agent',
      speakerName: 'NEXUS Autonomous Procurement Agent (Human Direct Command)',
      avatar: 'NX',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: userText,
      tag: 'Custom Human Directive',
      metrics: { status: 'Direct Bid' },
    };

    setDialogueMessages(prev => [...prev, newMsg]);
    setVisibleMessagesCount(prev => prev + 1);

    setTimeout(() => {
      const supplierResp = {
        id: `msg-resp-${Date.now()}`,
        speaker: 'supplier',
        speakerName: `${activeNegotiation.repName} (${activeNegotiation.name})`,
        avatar: activeNegotiation.repAvatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: `We have reviewed your specific instruction: "${userText}". We can accommodate this request with our revised terms of ₹${currentOffer.unitPriceINR}/unit with priority factory queueing.`,
        tag: 'Offer Revised',
        metrics: { price: `₹${currentOffer.unitPriceINR}`, leadTime: `${currentOffer.leadTimeDays} Days` },
      };
      setDialogueMessages(prev => [...prev, supplierResp]);
      setVisibleMessagesCount(prev => prev + 1);
      setDecisionStatus(null);
    }, 800);
  };

  const isRoundComplete = visibleMessagesCount >= dialogueMessages.length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8 animate-fade-in-up relative">
      
      {/* POPUP NOTIFICATION / TOAST BANNER (FIXED TOP-RIGHT) */}
      {popupToast && (
        <div className="fixed top-5 right-5 z-50 max-w-md animate-fade-in-up shadow-2xl">
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 backdrop-blur-md ${
            popupToast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/60 ring-2 ring-emerald-500/30'
              : popupToast.type === 'danger'
              ? 'bg-rose-950/95 text-rose-100 border-rose-500/60 ring-2 ring-rose-500/30'
              : 'bg-slate-900/95 text-white border-orange-500/60 ring-2 ring-orange-500/30'
          }`}>
            <div className="shrink-0 mt-0.5">
              {popupToast.type === 'success' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {popupToast.type === 'danger' && (
                <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {popupToast.type === 'info' && (
                <div className="w-7 h-7 rounded-full bg-orange-500/20 text-brand-400 flex items-center justify-center border border-orange-500/40">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-0.5 pr-1 text-xs">
              <h4 className="font-extrabold uppercase tracking-wider font-sans">
                {popupToast.title}
              </h4>
              <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                {popupToast.message}
              </p>
            </div>

            <button
              onClick={() => setPopupToast(null)}
              className="text-white/60 hover:text-white shrink-0 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* COMPACT HEADER BANNER */}
      <div className="extej-card px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-orange-100 text-brand-600 shadow-xs">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700 font-mono">
                AI Negotiation Simulator
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 font-sans">
                Supplier Sourcing & Terms Negotiation Room
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#f8fafc] border border-slate-200 rounded-full px-3 py-1 text-xs flex items-center gap-2 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-brand-500" />
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {NEGOTIATION_SUPPLIERS.map(s => (
                <option key={s.id} value={s.id} className="text-slate-800">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Column + Live Term Sheet Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Dialogue Stream */}
        <div className="lg:col-span-8 extej-card p-5 space-y-3 flex flex-col justify-between min-h-[500px]">
          
          {/* Dialogue Header with Initialisation & Progress Controls */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-brand-700 shadow-xs text-xs">
                {activeNegotiation.repAvatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900">{activeNegotiation.repName}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                    Round {currentRoundIndex + 1}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{activeNegotiation.repRole} • {activeNegotiation.name}</span>
              </div>
            </div>

            {/* Turn & Auto-Play Controls */}
            <div className="flex items-center gap-1.5">
              {!isRoundComplete && (
                <>
                  <button
                    onClick={handleAutoPlay}
                    disabled={isAutoPlaying}
                    className="btn-secondary-pill px-3 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-brand-500" />
                    <span>{isAutoPlaying ? 'Playing...' : 'Auto-Play'}</span>
                  </button>
                  <button
                    onClick={handleNextMessage}
                    className="btn-orange-pill px-3 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Turn</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}

              {isRoundComplete && (
                <>
                  {decisionStatus === 'approved' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Consensus Finalised
                    </span>
                  )}
                  {decisionStatus === 'disapproved' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold flex items-center gap-1 border border-rose-300">
                      <AlertTriangle className="w-3 h-3 text-rose-700" /> Strategy Disapproved
                    </span>
                  )}
                  {decisionStatus === null && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" /> Decision Pending
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Messages Feed Container */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
            {dialogueMessages.slice(0, visibleMessagesCount).map((msg) => {
              const isAgent = msg.speaker === 'nexus-agent';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 text-xs animate-fade-in-up ${
                    isAgent ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isAgent && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0 mt-0.5 shadow-xs">
                      {msg.avatar}
                    </div>
                  )}

                  <div className={`max-w-[85%] p-3.5 rounded-2xl space-y-1.5 ${
                    isAgent
                      ? 'bg-orange-50/70 border border-orange-200 text-slate-800 rounded-tr-none shadow-xs'
                      : 'bg-[#f8fafc] border border-slate-200/80 rounded-tl-none text-slate-800 shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between gap-2 text-[10px] border-b border-slate-200/50 pb-1">
                      <span className={`font-bold ${isAgent ? 'text-brand-700' : 'text-slate-600'}`}>
                        {msg.speakerName}
                      </span>
                      <span className="text-slate-400 font-mono font-medium">{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed text-[11px] font-medium">{msg.message}</p>

                    {msg.tag && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white text-brand-700 border border-orange-200/60 shadow-2xs">
                          {msg.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  {isAgent && (
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center font-bold text-[10px] text-white shrink-0 mt-0.5 shadow-md shadow-brand-500/20">
                      NX
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-Flight Negotiating Indicator */}
            {isNegotiatingRound && (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2 text-xs text-brand-800 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                <span className="font-bold font-sans">
                  NEXUS Autonomous Agent is applying bargaining leverage on Round {currentRoundIndex + 2}...
                </span>
              </div>
            )}

            {/* INITIAL PROMPT CARD IF AT MESSAGE 1 */}
            {visibleMessagesCount === 1 && !isAutoPlaying && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/60 border border-orange-200 flex items-center justify-between gap-3 text-xs animate-fade-in-up">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-brand-800 font-sans block">
                    ⚡ Supplier Opening Offer Received
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Initial quote: ₹{activeNegotiation.initialOffer.unitPriceINR}/unit with {activeNegotiation.initialOffer.leadTimeDays}-day lead time.
                  </p>
                </div>
                <button
                  onClick={handleStartFullNegotiation}
                  className="btn-orange-pill px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Autonomous Dialogue</span>
                </button>
              </div>
            )}

            {/* 3 OPTION BUTTONS SHOWN RIGHT BELOW THE FINAL MESSAGE ONCE ROUND IS COMPLETE */}
            {isRoundComplete && !isNegotiatingRound && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-orange-50/40 border border-slate-200 shadow-sm space-y-2 animate-fade-in-up mt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    <span className="font-extrabold text-slate-900 font-sans">
                      Executive Procurement Decision (Round {currentRoundIndex + 1})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    SELECT ACTION
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {/* 1. APPROVE BUTTON (Green) */}
                  <button
                    onClick={handleApprove}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] ${
                      decisionStatus === 'approved'
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-md font-black'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  {/* 2. DISAPPROVE BUTTON (Red) */}
                  <button
                    onClick={handleDisapprove}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] ${
                      decisionStatus === 'disapproved'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-md font-black'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Disapprove</span>
                  </button>

                  {/* 3. NEGOTIATE FURTHER BUTTON (Orange theme) */}
                  <button
                    onClick={handleNegotiateFurther}
                    className="btn-orange-pill px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    <span>Negotiate Further ➔</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* User Custom Proposal Input */}
          <form onSubmit={handleSendCustomOffer} className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Inject custom directive (e.g. 'Demand 0% rush fee and 6-month dual-sourcing')..."
              value={customOfferText}
              onChange={(e) => setCustomOfferText(e.target.value)}
              className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-full px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white shadow-inner font-medium"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-sm cursor-pointer"
              title="Send custom counter-offer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right 4 Cols: Live Concession & Term Sheet Card */}
        <div className="lg:col-span-4 extej-card p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Supplier Trust & Reliability Index Card (Enlarged Gauge) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 border border-orange-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-orange-100/80">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-brand-500" />
                  Supplier Reliability & Trust Index
                </span>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeNegotiation.reliabilityScore >= 97 ? 'Gold SLA' : 'Tier-1 Rated'}
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                {/* Semicircular Meter Gauge (Enlarged) */}
                <div className="relative w-32 h-18 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 120 68" className="w-full h-full">
                    <defs>
                      <linearGradient id="negTrustMeterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff7a1a" />
                        <stop offset="60%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    {/* Background Semicircle Arc */}
                    <path
                      d="M 14 58 A 46 46 0 0 1 106 58"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Active Gradient Arc */}
                    <path
                      d="M 14 58 A 46 46 0 0 1 106 58"
                      fill="none"
                      stroke="url(#negTrustMeterGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="144.5"
                      strokeDashoffset={144.5 * (1 - (activeNegotiation.reliabilityScore || 95) / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Centered Score */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                    <span className="font-black font-mono text-lg text-slate-900 leading-none">
                      {activeNegotiation.reliabilityScore || 95}%
                    </span>
                    <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Trust Score
                    </span>
                  </div>
                </div>

                {/* Consignment Batches & Reliability Metrics */}
                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-white px-2.5 py-1 rounded-lg border border-orange-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium">Consignments:</span>
                    <span className="font-mono font-black text-slate-900 text-xs">
                      {(activeNegotiation.historicalConsignments || 1200).toLocaleString()} Batches
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white px-2.5 py-1 rounded-lg border border-orange-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium">On-Time SLA:</span>
                    <span className="font-mono font-black text-emerald-600 text-xs">
                      {activeNegotiation.onTimeRate || 98.5}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Commercial Concessions Header */}
            <div className="pb-1.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-500" />
                  Live Commercial Concessions
                </h3>
                <p className="text-[10px] text-slate-400">
                  Round {currentRoundIndex + 1} outcome delta
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            {/* Before vs After Concessions */}
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 space-y-0.5">
                <div className="flex justify-between text-slate-500 text-[10px] font-medium">
                  <span>Unit Price per SoC:</span>
                  <span className="text-emerald-600 font-bold font-mono">
                    ₹{activeNegotiation.initialOffer.unitPriceINR - currentOffer.unitPriceINR} Savings
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono font-extrabold">
                  <span className="text-slate-400 line-through text-xs">₹{activeNegotiation.initialOffer.unitPriceINR}</span>
                  <span className="text-emerald-600 text-sm">₹{currentOffer.unitPriceINR}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 space-y-0.5">
                <div className="flex justify-between text-slate-500 text-[10px] font-medium">
                  <span>Delivery Lead Time:</span>
                  <span className="text-amber-600 font-bold font-mono">
                    -{activeNegotiation.initialOffer.leadTimeDays - currentOffer.leadTimeDays}d Compressed
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono font-extrabold">
                  <span className="text-slate-400 line-through text-xs">{activeNegotiation.initialOffer.leadTimeDays} Days</span>
                  <span className="text-amber-600 text-sm">{currentOffer.leadTimeDays} Days</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wider block">
                  Total Cost Avoidance
                </span>
                <span className="text-lg font-extrabold text-emerald-700 font-mono">
                  ₹{currentOffer.estimatedCostSavingsCr} Cr Net Savings
                </span>
              </div>
            </div>
          </div>

          {/* Action to Sign MOU (Clearly in Viewport) */}
          <div className="pt-1.5 border-t border-slate-100">
            <button
              onClick={async () => {
                setShowTermSheet(true);
                setIsSigned(true);
                try {
                  const mou = await nexusApi.generateMOU(selectedSupplierId, currentOffer);
                  setGeneratedMOU(mou);
                } catch {
                  // Fallback to local
                }
                if (onSignTermSheet) onSignTermSheet(activeNegotiation);
              }}
              className="w-full btn-purple-pill py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isSigned ? '✓ Term Sheet Executed' : 'Generate & Execute Binding MOU'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Term Sheet Modal */}
      {showTermSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="extej-card p-6 max-w-xl w-full bg-white shadow-2xl space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-brand-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Commercial Term Sheet & MOU</h3>
                  <p className="text-xs text-slate-400 font-medium font-mono">
                    Contract Ref: {generatedMOU?.documentId || `NEXUS-MOU-2026-R${currentRoundIndex + 1}-AZ`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermSheet(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="text-slate-500 pb-1.5 border-b border-slate-200 font-sans font-bold flex justify-between">
                  <span>BUYER: AURA Devices Inc.</span>
                  <span>SELLER: {activeNegotiation.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-0.5">
                  <div>Committed Volume: <span className="text-slate-900 font-bold">{currentOffer.capacityUnits.toLocaleString()} Units/mo</span></div>
                  <div>Final Unit Price: <span className="text-emerald-600 font-bold">₹{currentOffer.unitPriceINR} INR</span></div>
                  <div>Lead Time: <span className="text-amber-600 font-bold">{currentOffer.leadTimeDays} Days (Air Express)</span></div>
                  <div>Contract Term: <span className="text-slate-900 font-bold">{currentOffer.minimumContractMonths} Months Guaranteed</span></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-slate-700 text-[11px] leading-relaxed">
                ✓ <strong>Legal Agreement:</strong> Seller guarantees priority manufacturing line allocation. Zero penalty applies to AURA in the event of upstream force majeure. Payment terms: Net 30 days.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowTermSheet(false)}
                className="btn-secondary-pill px-4 py-2 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("MOU Successfully Transmitted to Procurement ERP & Supplier EDI Gateway.");
                  setShowTermSheet(false);
                }}
                className="btn-orange-pill px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Transmit EDI Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
