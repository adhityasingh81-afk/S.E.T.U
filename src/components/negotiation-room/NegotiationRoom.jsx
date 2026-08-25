import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { NEGOTIATION_SUPPLIERS, getSupplierNegotiation } from '../../engine/negotiationEngine';

export function NegotiationRoom({ onSignTermSheet }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup-phoenix-semi');
  const [activeNegotiation, setActiveNegotiation] = useState(getSupplierNegotiation('sup-phoenix-semi'));
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(2);
  const [customOfferText, setCustomOfferText] = useState('');
  const [showTermSheet, setShowTermSheet] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    const neg = getSupplierNegotiation(selectedSupplierId);
    setActiveNegotiation(neg);
    setVisibleMessagesCount(2);
    setIsSigned(false);
  }, [selectedSupplierId]);

  const handleNextMessage = () => {
    if (visibleMessagesCount < activeNegotiation.dialogueScript.length) {
      setVisibleMessagesCount(prev => prev + 1);
    }
  };

  const handleAutoPlay = () => {
    setIsAutoPlaying(true);
    let count = visibleMessagesCount;
    const interval = setInterval(() => {
      if (count < activeNegotiation.dialogueScript.length) {
        count++;
        setVisibleMessagesCount(count);
      } else {
        clearInterval(interval);
        setIsAutoPlaying(false);
      }
    }, 1200);
  };

  const handleSendCustomOffer = (e) => {
    e.preventDefault();
    if (!customOfferText.trim()) return;

    const newMsg = {
      id: `msg-custom-${Date.now()}`,
      speaker: 'nexus-agent',
      speakerName: 'NEXUS Autonomous Procurement Agent (Human Instructed)',
      avatar: 'NX',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: customOfferText,
      tag: 'Strategic Counter-Offer',
      metrics: { status: 'Under Review' },
    };

    activeNegotiation.dialogueScript.splice(visibleMessagesCount, 0, newMsg);
    setVisibleMessagesCount(prev => prev + 1);
    setCustomOfferText('');

    setTimeout(() => {
      const supplierResp = {
        id: `msg-resp-${Date.now()}`,
        speaker: 'supplier',
        speakerName: `${activeNegotiation.repName} (${activeNegotiation.name})`,
        avatar: activeNegotiation.repAvatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: `We have reviewed your specific counter-proposal. We accept the requested terms: Unit price fixed at ₹${activeNegotiation.negotiatedOffer.unitPriceINR}, lead time 4 days.`,
        tag: 'Offer Accepted',
        metrics: { price: `₹${activeNegotiation.negotiatedOffer.unitPriceINR}`, leadTime: '4 Days' },
      };
      activeNegotiation.dialogueScript.splice(visibleMessagesCount + 1, 0, supplierResp);
      setVisibleMessagesCount(prev => prev + 1);
    }, 1000);
  };

  const isNegotiationFinished = visibleMessagesCount >= activeNegotiation.dialogueScript.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Header Banner */}
      <div className="extej-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-orange-100 text-brand-600">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700">
                AI Negotiation Simulator
              </span>
              <span className="text-xs text-slate-400 font-semibold">Autonomous Procurement Dialogue</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-sans">
              Supplier Sourcing & Terms Negotiation Room
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Simulate autonomous commercial negotiations with alternative qualified suppliers to compress lead times and eliminate price gouging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#f8fafc] border border-slate-200 rounded-full px-3.5 py-1.5 text-xs flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-brand-500" />
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Dialogue Stream */}
        <div className="lg:col-span-8 extej-card p-6 space-y-4 flex flex-col justify-between min-h-[580px]">
          {/* Dialogue Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-brand-700">
                {activeNegotiation.repAvatar}
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block">{activeNegotiation.repName}</span>
                <span className="text-[10px] text-slate-400 font-medium">{activeNegotiation.repRole} • {activeNegotiation.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isNegotiationFinished && (
                <>
                  <button
                    onClick={handleAutoPlay}
                    disabled={isAutoPlaying}
                    className="btn-secondary-pill px-3 py-1.5 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-brand-500" />
                    <span>{isAutoPlaying ? 'Playing...' : 'Auto-Play'}</span>
                  </button>
                  <button
                    onClick={handleNextMessage}
                    className="btn-orange-pill px-3.5 py-1.5 text-[11px] font-bold"
                  >
                    Next Turn ➔
                  </button>
                </>
              )}
              {isNegotiationFinished && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Consensus Finalized
                </span>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
            {activeNegotiation.dialogueScript.slice(0, visibleMessagesCount).map((msg) => {
              const isAgent = msg.speaker === 'nexus-agent';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs animate-fade-in-up ${
                    isAgent ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isAgent && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0 mt-1">
                      {msg.avatar}
                    </div>
                  )}

                  <div className={`max-w-[82%] p-4 rounded-2xl space-y-2 ${
                    isAgent
                      ? 'bg-orange-50/70 border border-orange-200 text-slate-800 rounded-tr-none shadow-sm'
                      : 'bg-[#f8fafc] border border-slate-200/80 rounded-tl-none text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between gap-2 text-[10px] border-b border-slate-200/60 pb-1">
                      <span className={`font-bold ${isAgent ? 'text-brand-700' : 'text-slate-600'}`}>
                        {msg.speakerName}
                      </span>
                      <span className="text-slate-400 font-mono font-medium">{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed text-[11px] font-medium">{msg.message}</p>

                    {msg.tag && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-brand-700 border border-orange-200/60 shadow-xs">
                          {msg.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  {isAgent && (
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-[10px] text-white shrink-0 mt-1 shadow-md shadow-brand-500/20">
                      NX
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Custom Proposal Input */}
          <form onSubmit={handleSendCustomOffer} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Inject custom procurement instruction (e.g. 'Offer 6-month commitment for zero rush surcharge')..."
              value={customOfferText}
              onChange={(e) => setCustomOfferText(e.target.value)}
              className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white shadow-inner font-medium"
            />
            <button
              type="submit"
              className="p-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-md shadow-brand-500/20 cursor-pointer"
              title="Send custom counter-offer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right 4 Cols: Live Concession & Term Sheet Card */}
        <div className="lg:col-span-4 extej-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Live Commercial Concessions
              </h3>
              <p className="text-xs text-slate-400">
                Autonomous negotiation outcome delta
              </p>
            </div>

            {/* Before vs After Concessions */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500 text-[11px] font-medium">
                  <span>Unit Price per SoC:</span>
                  <span className="text-emerald-600 font-bold font-mono">₹250 Savings / Unit</span>
                </div>
                <div className="flex items-center justify-between font-mono font-extrabold pt-1">
                  <span className="text-slate-400 line-through">₹{activeNegotiation.initialOffer.unitPriceINR}</span>
                  <span className="text-emerald-600 text-base">₹{activeNegotiation.negotiatedOffer.unitPriceINR}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500 text-[11px] font-medium">
                  <span>Delivery Lead Time:</span>
                  <span className="text-amber-600 font-bold font-mono">-6 Days Compressed</span>
                </div>
                <div className="flex items-center justify-between font-mono font-extrabold pt-1">
                  <span className="text-slate-400 line-through">{activeNegotiation.initialOffer.leadTimeDays} Days</span>
                  <span className="text-amber-600 text-base">{activeNegotiation.negotiatedOffer.leadTimeDays} Days</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500 text-[11px] font-medium">
                  <span>Rush Surcharge:</span>
                  <span className="text-brand-600 font-bold font-mono">75% Waived</span>
                </div>
                <div className="flex items-center justify-between font-mono font-extrabold pt-1">
                  <span className="text-slate-400 line-through">{activeNegotiation.initialOffer.rushSurchargePct}%</span>
                  <span className="text-brand-600 text-base">{activeNegotiation.negotiatedOffer.rushSurchargePct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">
                  Total Cost Avoidance
                </span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                  ₹{activeNegotiation.negotiatedOffer.estimatedCostSavingsCr} Cr Net Savings
                </span>
              </div>
            </div>
          </div>

          {/* Action to Sign MOU */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setShowTermSheet(true);
                setIsSigned(true);
                if (onSignTermSheet) onSignTermSheet(activeNegotiation);
              }}
              className="w-full btn-orange-pill py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
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
          <div className="extej-card p-6 max-w-xl w-full bg-white shadow-2xl space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-brand-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Commercial Term Sheet & MOU</h3>
                  <p className="text-xs text-slate-400 font-medium">Contract Ref: NEXUS-MOU-2026-089-AZ</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermSheet(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="text-slate-500 pb-2 border-b border-slate-200 font-sans font-bold flex justify-between">
                  <span>BUYER: AURA Devices Inc.</span>
                  <span>SELLER: {activeNegotiation.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-slate-700 pt-1">
                  <div>Committed Volume: <span className="text-slate-900 font-bold">{activeNegotiation.negotiatedOffer.capacityUnits.toLocaleString()} Units/mo</span></div>
                  <div>Final Unit Price: <span className="text-emerald-600 font-bold">₹{activeNegotiation.negotiatedOffer.unitPriceINR} INR</span></div>
                  <div>Lead Time: <span className="text-amber-600 font-bold">{activeNegotiation.negotiatedOffer.leadTimeDays} Days (Air Express)</span></div>
                  <div>Contract Term: <span className="text-slate-900 font-bold">{activeNegotiation.negotiatedOffer.minimumContractMonths} Months Guaranteed</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-slate-700 text-[11px] leading-relaxed">
                ✓ <strong>Legal Agreement:</strong> Seller guarantees Phoenix Line 4 priority allocation. Zero penalty applies to AURA in the event of upstream force majeure. Payment terms: Net 30 days.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
                className="btn-orange-pill px-4 py-2 text-xs font-bold flex items-center gap-1.5"
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
