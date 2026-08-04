import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../hooks/usePWA';
import { useWebPush } from '../hooks/useWebPush';
import { Modal } from './Modal';
import { Bell, Smartphone, User as UserIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { COLLEGES, DEPARTMENTS, SEMESTERS } from '../constants';
import { AddressForm } from './AddressForm';
import { safeGetItem, safeSetItem } from '../utils/storage';
import type { AddressFormData } from './AddressForm';

export const AppSetupModal: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { isInstallable, isStandalone, installApp } = usePWA();
  const { permission, requestPushPermission } = useWebPush();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(permission === 'granted');
  const [isPwaInstalled, setIsPwaInstalled] = useState(
    isStandalone || safeGetItem('pwa_installed') === 'true'
  );

  // Address form state (single object)
  const [address, setAddress] = useState<AddressFormData>({
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    countryCode: 'IN',
    coordinates: null,
  });
  const [userCollege, setUserCollege] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userSemester, setUserSemester] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form from user data
  useEffect(() => {
    if (user) {
      setAddress({
        addressLine: user.addressLine || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',
        countryCode: '',
        coordinates: user.coordinates || null,
      });
      setUserCollege(user.college || COLLEGES[0] || '');
      setUserDepartment(user.department || DEPARTMENTS[0] || '');
      setUserSemester(user.semester || 1);
    }
  }, [user]);

  const isIOS = typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  const needsAddress = user ? (!user.city || !user.pincode) : false;
  const needsNotifications = permission !== 'granted';
  // Mobile requires PWA to be standalone first; desktop fallback to isInstallable
  const needsPwa = isMobile ? (!isStandalone && safeGetItem('pwa_installed') !== 'true') : (isInstallable && !isStandalone && safeGetItem('pwa_installed') !== 'true');

  // Check if we should display the modal
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    // Ask everytime on mobile if notifications or PWA are missing
    const forcePrompt = isMobile && (needsNotifications || needsPwa);
    const hasDismissed = sessionStorage.getItem('setup_modal_dismissed') === 'true';
    if (hasDismissed && !forcePrompt) {
      return;
    }

    // Open if there is something pending to setup
    if (needsAddress || needsNotifications || needsPwa) {
      setIsOpen(true);
    }
  }, [user, permission, isInstallable, isStandalone, needsAddress, needsNotifications, needsPwa, isMobile]);

  // Synchronize state when hook permissions update
  useEffect(() => {
    setIsNotificationsEnabled(permission === 'granted');
  }, [permission]);

  useEffect(() => {
    setIsPwaInstalled(isStandalone || safeGetItem('pwa_installed') === 'true');
  }, [isStandalone]);

  const handleNotificationToggle = async () => {
    if (isNotificationsEnabled) return;
    
    try {
      const result = await requestPushPermission();
      if (result === 'granted') {
        setIsNotificationsEnabled(true);
        showToast('Push notifications enabled!', 'success');
      } else if (result === 'denied') {
        showToast('Notification permission denied. Please reset browser settings to allow.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to enable push notifications.', 'danger');
    }
  };

  const handlePwaInstallToggle = async () => {
    if (isPwaInstalled) return;

    try {
      const success = await installApp();
      if (success) {
        setIsPwaInstalled(true);
        safeSetItem('pwa_installed', 'true');
        showToast('App added to Home Screen!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to install app.', 'danger');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.city.trim() || !address.pincode.trim() || !address.addressLine.trim() || !address.state.trim()) {
      showToast('Please fill out all address fields.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateProfile({
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
        college: userCollege,
        department: userDepartment,
        semester: userSemester,
        ...(address.coordinates ? { coordinates: address.coordinates } : {}),
      });
      if (success) {
        showToast('Profile and address updated!', 'success');
      } else {
        showToast('Failed to update address.', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving profile changes.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('setup_modal_dismissed', 'true');
    safeSetItem('pwa_installed', 'true'); // Persist so browser tab stops prompting after user closes/completes
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={needsAddress ? "Complete Profile & Address" : "Complete App Setup"} maxWidth="sm">
      {needsAddress ? (
        <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
          <p className="text-xs text-muted leading-relaxed">
            Please complete your student profile and enter your address. This helps us calculate distances for campus pickups and match you with nearby sellers.
          </p>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-textDark border-b border-borderCustom pb-1 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-primary" />
              <span>Student Details</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-textDark uppercase">Department</label>
                <select
                  value={userDepartment}
                  onChange={(e) => setUserDepartment(e.target.value)}
                  className="bg-background border border-borderCustom rounded-lg p-2 pr-8 truncate text-xs text-textDark focus:border-primary focus:outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-textDark uppercase">Semester</label>
                <select
                  value={userSemester}
                  onChange={(e) => setUserSemester(Number(e.target.value))}
                  className="bg-background border border-borderCustom rounded-lg p-2 pr-8 truncate text-xs text-textDark focus:border-primary focus:outline-none"
                >
                  {SEMESTERS.map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-textDark uppercase">College Campus</label>
              <select
                value={userCollege}
                onChange={(e) => setUserCollege(e.target.value)}
                className="bg-background border border-borderCustom rounded-lg p-2 text-xs text-textDark focus:border-primary focus:outline-none"
              >
                {COLLEGES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <h4 className="text-xs font-bold text-textDark border-b border-borderCustom pb-1 mt-2 flex items-center gap-1.5">
              <span>📍</span>
              <span>Address Details</span>
            </h4>

            <AddressForm
              value={address}
              onChange={setAddress}
              compact
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-subtle focus:outline-none disabled:opacity-50 mt-2"
          >
            {isSaving ? 'Saving details...' : 'Save & Continue'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-xs text-muted leading-relaxed">
            Configure RevoShelf on your mobile device to receive real-time push alerts for chat messages and listing updates.
          </p>

          <div className="flex flex-col gap-4">
            {/* Step 1: Install PWA (Mobile-first app wrapper) */}
            {needsPwa ? (
              <div className="border border-borderCustom rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-textDark">Step 1: Install RevoShelf App</span>
                    <span className="text-[10px] text-muted">Add RevoShelf to your Home Screen to unlock push alerts</span>
                  </div>
                </div>

                {isIOS ? (
                  /* Custom iOS Safari walkthrough */
                  <div className="bg-white border border-borderCustom rounded-lg p-3 mt-1 flex flex-col gap-2.5 text-[11px] text-textDark">
                    <p className="font-bold text-primary">Safari Installation Steps:</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex-shrink-0">1</span>
                      <span>Tap the <strong>Share</strong> button at the bottom of Safari:</span>
                      <span className="inline-block p-1 bg-slate-100 rounded border border-slate-200 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex-shrink-0">2</span>
                      <span>Scroll down and select <strong>Add to Home Screen</strong>:</span>
                      <span className="inline-block p-1 bg-slate-100 rounded border border-slate-200 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex-shrink-0">3</span>
                      <span>Open the new <strong>RevoShelf</strong> icon on your Home Screen!</span>
                    </div>
                  </div>
                ) : (
                  /* Standard / Android prompt */
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={handlePwaInstallToggle}
                      disabled={isPwaInstalled}
                      type="button"
                      className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-1.5 px-4 rounded-lg focus:outline-none transition-colors"
                    >
                      Install App
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Success state: App is standalone */
              <div className="flex items-center justify-between border border-borderCustom rounded-xl p-4 bg-green-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 text-green-700 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-green-800">RevoShelf App Installed</span>
                    <span className="text-[10px] text-green-700">Running in standalone mode</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700">✓ Done</span>
              </div>
            )}

            {/* Step 2: Push Notifications */}
            {needsNotifications && (
              <div className={`border border-borderCustom rounded-xl p-4 flex flex-col gap-2 ${needsPwa ? 'opacity-60 bg-slate-100/50' : 'bg-slate-50/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${needsPwa ? 'bg-slate-200 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-textDark">
                        {needsPwa ? 'Step 2: Push Notifications' : 'Enable Push Notifications'}
                      </span>
                      <span className="text-[10px] text-muted">Receive alerts on chat messages & orders</span>
                    </div>
                  </div>
                  
                  {needsPwa ? (
                    /* Locked state indicator */
                    <div className="p-1.5 bg-slate-200 text-slate-400 rounded-lg flex items-center justify-center" title="Complete PWA installation first">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  ) : (
                    /* Unlocked Toggle Switch */
                    <button
                      onClick={handleNotificationToggle}
                      disabled={isNotificationsEnabled}
                      type="button"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isNotificationsEnabled ? 'bg-success cursor-default' : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>

                {needsPwa && (
                  <p className="text-[10px] text-slate-500 italic mt-1 leading-snug">
                    🔒 Push notifications require RevoShelf to be opened as an installed App. Please complete Step 1 first.
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-subtle focus:outline-none"
          >
            {needsPwa ? 'Close Setup' : 'Done'}
          </button>
        </div>
      )}
    </Modal>
  );
};
