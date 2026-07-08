import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePWA } from '../hooks/usePWA';
import { User, ShieldCheck, Laptop, PhoneCall, Sparkles, Bell } from 'lucide-react';
import { COLLEGES, DEPARTMENTS, SEMESTERS } from '../constants';
import { default as api } from '../services/backendApi';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { isInstallable, isStandalone, installApp } = usePWA();

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    department: user?.department || '',
    semester: user?.semester || 1,
    avatar: user?.avatar || '',
    addressLine: user?.addressLine || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
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

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      showToast('Failed to log out.', 'danger');
    }
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      showToast('Notifications are not supported on this browser', 'warning');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);

      if (permission === 'granted') {
        let vapidKey: string;
        try {
          vapidKey = await api.getVapidPublicKey();
        } catch (err) {
          showToast('Failed to retrieve push credentials from server.', 'danger');
          return;
        }

        if (vapidKey && !vapidKey.includes('placeholder')) {
          const registration = await navigator.serviceWorker.ready;
          let subscription = await registration.pushManager.getSubscription();

          const urlBase64ToUint8Array = (base64String: string) => {
            const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
          };

          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });
          }

          if (subscription) {
            const keys = subscription.toJSON().keys;
            if (keys && keys.p256dh && keys.auth) {
              const payload = {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: keys.p256dh,
                  auth: keys.auth
                }
              };
              await api.subscribePush(payload);
              if (user) {
                localStorage.setItem(`push_endpoint_${user.id}`, subscription.endpoint);
                localStorage.setItem(`push_vapid_key_${user.id}`, vapidKey);
              }
              showToast('Push notifications successfully enabled!', 'success');
            }
          }
        } else {
          showToast('Allowed, but Web Push VAPID key is missing.', 'warning');
        }
      } else if (permission === 'denied') {
        showToast('Notification permission denied. Reset browser settings to enable.', 'warning');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      showToast('Failed to enable push notifications.', 'danger');
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

          {/* Address Section */}
          <div className="pt-2 border-t border-borderCustom">
            <h2 className="text-sm font-bold text-textDark pb-2.5 flex items-center gap-1.5 mb-3">
              <span className="text-primary">📍</span> Address Details
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-textDark uppercase tracking-wider">Address Line</label>
                <input
                  type="text"
                  placeholder="Apartment, Street address, etc."
                  value={formData.addressLine}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine: e.target.value }))}
                  className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-textDark uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-textDark uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-textDark uppercase tracking-wider">Pincode / Postal Code</label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle hover:shadow-md transition-colors focus:outline-none disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle transition-colors focus:outline-none"
            >
              Log Out
            </button>
          </div>
        </form>

        {/* Right Side: PWA Install Prompts & Status Panel */}
        <div className="flex flex-col gap-6 w-full md:w-auto md:flex-shrink-0">
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
                  type="button"
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle flex items-center justify-center gap-1.5 mt-2 focus:outline-none transition-colors"
                >
                  <Sparkles className="w-4.5 h-4.5" />
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

          {/* Right Side: Notification Permission Panel */}
          <aside className="bg-white border border-borderCustom rounded-2xl p-5 shadow-subtle flex flex-col gap-4">
            <h2 className="text-sm font-bold text-textDark border-b border-borderCustom pb-2.5 flex items-center gap-1.5">
              <Bell className="w-4.5 h-4.5 text-primary" />
              <span>Push Notifications</span>
            </h2>

            <div className="flex flex-col gap-3 text-xs text-muted leading-relaxed">
              <div>
                <span className="font-bold text-textDark block mb-0.5">Permission Status</span>
                <span className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-md text-[10px] font-bold mt-1 ${
                  notifPermission === 'granted'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : notifPermission === 'denied'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-slate-50 border-borderCustom text-textDark'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    notifPermission === 'granted'
                      ? 'bg-green-600'
                      : notifPermission === 'denied'
                        ? 'bg-red-600'
                        : 'bg-slate-400'
                  }`} />
                  <span>
                    {notifPermission === 'granted'
                      ? 'Enabled'
                      : notifPermission === 'denied'
                        ? 'Blocked (Reset in Browser)'
                        : 'Not Enabled'}
                  </span>
                </span>
              </div>

              <p className="mt-1">
                Receive real-time push alerts on your phone when you get chat messages, warning triggers, or account updates.
              </p>

              {notifPermission !== 'granted' && (
                <button
                  onClick={handleEnableNotifications}
                  type="button"
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle flex items-center justify-center gap-1.5 mt-2 focus:outline-none transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span>Enable Push Alerts</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
