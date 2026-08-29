import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Building2, 
  Heart, 
  Sparkles, 
  UserCheck, 
  Zap, 
  Globe2,
  Fingerprint,
  Layers,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { DEMO_USERS } from '../../data/usersData';
import { nexusApi } from '../../api/nexusApi';

export function LoginPage({ onLoginSuccess }) {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const selectedUser = DEMO_USERS[currentUserIndex];
  const [email, setEmail] = useState(selectedUser.email);
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Mouse tilt physics for frosted card
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Auto-cycle through quotes every 5.5 seconds (Jitter video style) - does NOT touch email input
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentUserIndex((prev) => (prev + 1) % DEMO_USERS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleMouseMoveHero = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 12,
      rotateY: x * 12,
    });
  };

  const handleMouseLeaveHero = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleSelectDemoUser = (user, index) => {
    setIsAutoPlay(false);
    setCurrentUserIndex(index);
    setEmail(user.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanEmail = (email || '').trim();
    const matchedDemoUser = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    const personaToSend = matchedDemoUser ? matchedDemoUser.persona : null;

    try {
      const authResponse = await nexusApi.login(cleanEmail, password, personaToSend);
      const user = authResponse?.user || authResponse;
      if (authResponse?.token) {
        localStorage.setItem('nexus_auth_token', authResponse.token);
      }
      setIsLoading(false);
      setLoginSuccess(true);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch {
      const username = cleanEmail.split('@')[0];
      const formattedName = username
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const fallbackUser = matchedDemoUser || {
        id: `usr-custom-${Date.now().toString(36)}`,
        email: cleanEmail,
        name: formattedName || 'Enterprise Operator',
        role: 'Custom Station Operator',
        persona: 'custom',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        quote: "Authorized user connected to NEXUS Network.",
        clearance: 'Tier-1 Command'
      };
      setIsLoading(false);
      setLoginSuccess(true);
      setTimeout(() => {
        onLoginSuccess(fallbackUser);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] flex items-center justify-center p-0 md:p-6 lg:p-8 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Main Split Luxury Card Container */}
      <div className="w-full max-w-6xl min-h-[640px] lg:h-[720px] bg-white md:rounded-[2.5rem] shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fade-in-up">
        
        {/* ================= LEFT 7 COLS: DYNAMIC AUTHOR PHOTOGRAPHY & FLOATING FROSTED CARD ================= */}
        <div 
          onMouseMove={handleMouseMoveHero}
          onMouseLeave={handleMouseLeaveHero}
          className="lg:col-span-7 relative min-h-[420px] lg:min-h-full overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-slate-900 select-none cursor-default"
          style={{ perspective: 1200 }}
        >
          {/* Multi-layered Cross-Fading Background Photographs for Each Author */}
          {DEMO_USERS.map((user, idx) => (
            <div
              key={user.id}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                currentUserIndex === idx ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
              }`}
              style={{
                backgroundImage: `url('${user.heroImage}')`,
                animation: currentUserIndex === idx ? 'kenBurns 24s ease-in-out infinite alternate' : 'none',
              }}
            >
              {/* Warm Golden Hour & Atmospheric Vignette Overlays */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/85 via-orange-950/45 to-amber-800/30 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-black/25"></div>
            </div>
          ))}

          {/* Floating Refractive Glow Orbs behind the Glass Bubble */}
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
          <div className="absolute bottom-12 right-1/4 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none animate-float-reverse"></div>

          {/* Floating Sunlit Dust Particles */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-40">
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-2/3 left-1/2 w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDuration: '5s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-orange-200 animate-ping" style={{ animationDuration: '4s' }}></div>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-20 flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              {/* Spinning Asterisk Brand Icon */}
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-lg shadow-lg hover:rotate-90 transition-transform duration-500">
                <span className="inline-block animate-spin-slow">✱</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
                NEXUS
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-white/80">
              <span className="hover:text-white transition-colors">nexus-chain.ai</span>
              {/* Auto-play toggle button */}
              <button
                type="button"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-[10px] text-white backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title={isAutoPlay ? "Pause Auto Story" : "Resume Auto Story"}
              >
                {isAutoPlay ? <Pause className="w-2.5 h-2.5 fill-white" /> : <Play className="w-2.5 h-2.5 fill-white" />}
                <span>{isAutoPlay ? "Story Auto" : "Paused"}</span>
              </button>
            </div>
          </div>

          {/* ================= HERO FROSTED GLASS TESTIMONIAL BUBBLE ================= */}
          <div 
            className="relative z-20 my-auto lg:my-0 lg:mt-auto pt-6 transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(25px)`,
            }}
          >
            {/* Silky Floating Frosted Glass Card with Animated Sheen */}
            <div className="relative overflow-hidden backdrop-blur-2xl bg-white/25 hover:bg-white/30 border border-white/40 rounded-[2rem] p-6 sm:p-7 text-white shadow-2xl shadow-black/40 max-w-lg transition-all duration-300 animate-float-card">
              
              {/* Animated Light Sheen Reflection sweeping across card */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none -translate-x-full"
                style={{
                  animation: 'shimmerSweep 6s infinite ease-in-out',
                }}
              ></div>

              {/* Cycling Progress Indicator Dots */}
              <div className="flex items-center gap-1.5 mb-3">
                {DEMO_USERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlay(false);
                      setCurrentUserIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentUserIndex === idx 
                        ? 'w-6 bg-white shadow-sm' 
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Quote with Keyframe Fade Animation */}
              <p 
                key={selectedUser.id}
                className="text-sm sm:text-base font-semibold leading-relaxed tracking-normal text-white drop-shadow-md animate-fade-in-up min-h-[64px]"
              >
                "{selectedUser.quote}"
              </p>

              {/* Author Strip */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/25">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white/70 shadow-md transform hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse"></span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-sm">
                      {selectedUser.name}
                    </h4>
                    <p className="text-[11px] text-white/85 font-medium">
                      {selectedUser.role}, {selectedUser.company}
                    </p>
                  </div>
                </div>

                {/* Animated Interactive Heart Reaction Button */}
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isLiked 
                      ? 'bg-rose-500/85 border-rose-400 text-white scale-110 shadow-lg shadow-rose-500/30 animate-heart-pop' 
                      : 'bg-white/25 hover:bg-white/40 border-white/40 text-white hover:scale-105'
                  }`}
                  title="Like story"
                >
                  <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-white text-white' : 'fill-transparent text-white'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom subtle watermark */}
          <div className="relative z-20 pt-4 flex justify-between items-center text-[10px] text-white/60 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Autonomous Supply Resilience
            </span>
            <span className="bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20">FIPS-140-2</span>
          </div>
        </div>

        {/* ================= RIGHT 5 COLS: SILKY LOGIN FORM & DEMO SELECTOR ================= */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-[#ffffff]">
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-brand-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Enterprise Access
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                Sign in to Station
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Enter your workstation credentials or select an instant demo role
              </p>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Select Demo Persona</span>
                <span className="text-brand-600 font-bold text-[10px]">1-Click Sign In</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((user, idx) => {
                  const isSelected = email.toLowerCase() === user.email.toLowerCase();
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectDemoUser(user, idx)}
                      className={`p-2 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-brand-500 ring-2 ring-brand-500/20 shadow-sm scale-[1.02]'
                          : 'bg-[#f8fafc] border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-900 truncate">
                          {user.name.split(' ')[0]}
                        </div>
                        <div className="text-[9.5px] text-slate-400 truncate font-medium">
                          {user.role.split(' ')[0]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Workstation Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsAutoPlay(false);
                    }}
                    onFocus={() => setIsAutoPlay(false)}
                    placeholder="e.g. yourname@company.com"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Security Key</label>
                  <button
                    type="button"
                    onClick={() => alert("Okta SSO passphrase reset dispatched.")}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    Forgot Key?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Station */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400 accent-brand-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-semibold">Remember this station</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
                  BioPass Ready
                </span>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || loginSuccess}
                  className="w-full btn-orange-pill py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Security Clearance...</span>
                    </>
                  ) : loginSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Welcome back, {selectedUser.name.split(' ')[0]}!</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Autonomous Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
            Protected by NEXUS Zero-Trust Defense • AURA Enterprise Network
          </div>
        </div>
      </div>
    </div>
  );
}
