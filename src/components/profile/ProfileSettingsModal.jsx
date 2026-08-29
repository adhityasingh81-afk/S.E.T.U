import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Upload, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Mail, 
  Building, 
  Briefcase, 
  Award, 
  RefreshCw, 
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { nexusApi } from '../../api/nexusApi';

const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    name: 'Executive Lead',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Tech Architect',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    name: 'Logistics Director',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Operations Commander',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Modern Cyber Specialist',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    name: 'Senior Strategist',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-7',
    name: 'Global Lead',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-8',
    name: 'Tactical Analyst',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  }
];

export function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) {
  const fileInputRef = useRef(null);

  const [name, setName] = useState(currentUser?.name || 'Authorized Operator');
  const [email, setEmail] = useState(currentUser?.email || 'operator@nexus.ai');
  const [role, setRole] = useState(currentUser?.role || 'Chief Supply Chain Officer');
  const [clearance, setClearance] = useState(currentUser?.clearance || 'Tier-1 Command');
  const [quote, setQuote] = useState(currentUser?.quote || 'Autonomous resilience operational. Zero-defect supply chain protocol active.');
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0].url);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatar(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  const handleRandomizeAvatar = () => {
    const remaining = PRESET_AVATARS.filter(a => a.url !== avatar);
    const chosen = remaining[Math.floor(Math.random() * remaining.length)];
    if (chosen) {
      setAvatar(chosen.url);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedUser = {
      ...currentUser,
      name: name.trim() || 'Authorized Operator',
      email: email.trim(),
      role: role.trim() || 'Chief Supply Chain Officer',
      clearance: clearance.trim() || 'Tier-1 Command',
      quote: quote.trim() || 'Autonomous resilience operational.',
      avatar: avatar || currentUser?.avatar,
    };

    try {
      await nexusApi.updateProfile(updatedUser);
    } catch {
      // Local fallback
    }

    // Save locally
    localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="extej-card p-6 sm:p-8 max-w-2xl w-full bg-white shadow-2xl space-y-6 my-auto animate-fade-in-up text-slate-800 border border-slate-200/80">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-brand-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-sans">
                  Station Profile & Identity Manager
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-brand-700 font-mono">
                  {clearance}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Customize your profile avatar, workstation title, and autonomous clearance credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar Editor Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Live Interactive Avatar Bubble */}
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/30 shadow-lg group-hover:ring-brand-500 transition-all"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                title="Upload Photo"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Change</span>
              </button>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Station Status"></span>
            </div>

            {/* Avatar Controls */}
            <div className="space-y-2.5 flex-1 text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-sans">Profile Photo & Identity Avatar</h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Choose from curated executive portraits, upload a custom image file, or enter an image URL
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary-pill px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-brand-300"
                >
                  <Upload className="w-3.5 h-3.5 text-brand-500" />
                  <span>Upload from Computer</span>
                </button>

                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="btn-secondary-pill px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-brand-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cycle Preset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Avatars Gallery */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Or Choose an Executive Preset
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatar(preset.url)}
                    className={`relative rounded-full shrink-0 transition-all cursor-pointer p-0.5 ${
                      isSelected
                        ? 'ring-3 ring-brand-500 scale-110 shadow-md'
                        : 'hover:scale-105 opacity-75 hover:opacity-100 ring-1 ring-slate-200'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Custom Photo URL Input */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2">
            <div className="relative flex-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="Or paste any custom image URL (e.g. https://...)"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="btn-secondary-pill px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              Apply URL
            </button>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-500" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adhitya Singh"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Workstation Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-500" />
                Workstation Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Enterprise Role */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-500" />
                Enterprise Role / Title
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Chief Supply Chain Officer"
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Security Clearance */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Station Clearance Level
              </label>
              <select
                value={clearance}
                onChange={(e) => setClearance(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner cursor-pointer"
              >
                <option value="Tier-1 Command">Tier-1 Command (Full Executive Clearance)</option>
                <option value="Director Operations">Director Operations (Autonomous Reroute Ready)</option>
                <option value="Strategic Sourcing">Strategic Sourcing (Procurement Sign-off)</option>
                <option value="Operations Commander">Operations Commander (Factory Control)</option>
              </select>
            </div>
          </div>

          {/* Status Quote / Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              Operational Mantra & Station Bio
            </label>
            <textarea
              rows={2}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter your personal operational directive..."
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pill px-4 py-2.5 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || savedSuccess}
              className="btn-orange-pill px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Profile to Database...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Profile Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
