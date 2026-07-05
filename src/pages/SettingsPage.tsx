import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePWA } from '../hooks/usePWA';
import { User, ShieldCheck, Laptop, PhoneCall, Sparkles } from 'lucide-react';
import { COLLEGES, DEPARTMENTS, SEMESTERS } from '../constants';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { isInstallable, isStandalone, installApp } = usePWA();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    department: user?.department || '',
    semester: user?.semester || 1,
    avatar: user?.avatar || '',
  });
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Name is required', 'warning');
      return;
    }
    
    setIsUpdating(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        showToast('Settings saved successfully!', 'success');
      } else {
        showToast('Failed to save settings.', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update settings.', 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) {
      showToast('App installed successfully!', 'success');
    } else {
      showToast('Installation cancelled or failed.', 'warning');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-textDark tracking-tight">Account Settings</h1>
        <p className="text-xs text-muted mt-1">Manage student details, campus filters, and PWA options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side: General Profile Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white border border-borderCustom rounded-2xl p-5 md:p-6 shadow-subtle flex flex-col gap-4">
          <h2 className="text-sm font-bold text-textDark border-b border-borderCustom pb-2.5">Student Credentials</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">University / College Campus</label>
            <select
              value={formData.college}
              onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
              className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
            >
              {COLLEGES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-textDark uppercase tracking-wider">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-textDark uppercase tracking-wider">Current Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: Number(e.target.value) }))}
                className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
              >
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">Profile Avatar Image Link</label>
            <input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle hover:shadow-md transition-colors mt-2 focus:outline-none disabled:opacity-50 self-start"
          >
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Right Side: PWA Install Prompts & Status Panel */}
        <aside className="bg-white border border-borderCustom rounded-2xl p-5 shadow-subtle flex flex-col gap-4">
          <h2 className="text-sm font-bold text-textDark border-b border-borderCustom pb-2.5 flex items-center gap-1.5">
            <Laptop className="w-4.5 h-4.5 text-primary" />
            <span>App Installation</span>
          </h2>

          <div className="flex flex-col gap-3 text-xs text-muted leading-relaxed">
            <div>
              <span className="font-bold text-textDark block mb-0.5">PWA Installation Status</span>
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-borderCustom px-2.5 py-1 rounded-md text-[10px] font-bold text-textDark mt-1">
                <ShieldCheck className={`w-3.5 h-3.5 ${isStandalone ? 'text-success' : 'text-slate-400'}`} />
                <span>{isStandalone ? 'Running Standalone PWA' : 'Running in Web Browser'}</span>
              </span>
            </div>

            <p className="mt-1">
              Campus Marketplace supports Progressive Web App features. Install it on your device for offline catalog access, instant loading, and fullscreen student experience.
            </p>

            {isInstallable && !isStandalone && (
              <button
                onClick={handleInstallClick}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle flex items-center justify-center gap-1.5 mt-2 focus:outline-none transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Install Application</span>
              </button>
            )}

            {!isInstallable && !isStandalone && (
              <div className="bg-slate-50 border border-borderCustom p-2.5 rounded-lg text-[10px] text-muted leading-tight mt-1">
                Tip: If installation prompts do not appear, you can manually install the app using your browser's menu (click Share/Add to Home Screen in Safari/Chrome).
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
