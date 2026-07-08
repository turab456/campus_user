import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../hooks/usePWA';
import { useWebPush } from '../hooks/useWebPush';
import { Modal } from './Modal';
import { Bell, Smartphone, User as UserIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { COLLEGES, DEPARTMENTS, SEMESTERS } from '../constants';
import { AddressForm } from './AddressForm';
import type { AddressFormData } from './AddressForm';

export const AppSetupModal: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { isInstallable, isStandalone, installApp } = usePWA();
  const { permission, requestPushPermission } = useWebPush();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(permission === 'granted');
  const [isPwaInstalled, setIsPwaInstalled] = useState(
    isStandalone || localStorage.getItem('pwa_installed') === 'true'
  );

  // Address form state (single object)
  const [address, setAddress] = useState<AddressFormData>({
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
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
        coordinates: user.coordinates || null,
      });
      setUserCollege(user.college || COLLEGES[0] || '');
      setUserDepartment(user.department || DEPARTMENTS[0] || '');
      setUserSemester(user.semester || 1);
    }
  }, [user]);

  const needsAddress = user ? (!user.city || !user.pincode) : false;
  const needsNotifications = permission !== 'granted';
  const needsPwa = isInstallable && !isStandalone && localStorage.getItem('pwa_installed') !== 'true';

  // Check if we should display the modal
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    const hasDismissed = sessionStorage.getItem('setup_modal_dismissed') === 'true';
    if (hasDismissed) {
      return;
    }

    // Open if there is something pending to setup
    if (needsAddress || needsNotifications || needsPwa) {
      setIsOpen(true);
    }
  }, [user, permission, isInstallable, isStandalone, needsAddress, needsNotifications, needsPwa]);

  // Synchronize state when hook permissions update
  useEffect(() => {
    setIsNotificationsEnabled(permission === 'granted');
  }, [permission]);

  useEffect(() => {
    setIsPwaInstalled(isStandalone || localStorage.getItem('pwa_installed') === 'true');
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
        localStorage.setItem('pwa_installed', 'true');
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
                  className="bg-background border border-borderCustom rounded-lg p-2 text-xs text-textDark focus:border-primary focus:outline-none"
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
                  className="bg-background border border-borderCustom rounded-lg p-2 text-xs text-textDark focus:border-primary focus:outline-none"
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
            Enhance your Campus Marketplace experience by configuring push notifications and installing the PWA.
          </p>

          <div className="flex flex-col gap-4">
            {/* Notification Prompt */}
            {needsNotifications && (
              <div className="flex items-center justify-between border border-borderCustom rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-textDark">Push Notifications</span>
                    <span className="text-[10px] text-muted">Receive alerts on chat & orders</span>
                  </div>
                </div>
                
                {/* Toggle Switch */}
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
              </div>
            )}

            {/* Add to Homescreen Prompt */}
            {needsPwa && (
              <div className="flex items-center justify-between border border-borderCustom rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-textDark">Add to Homescreen</span>
                    <span className="text-[10px] text-muted">Install PWA for instant access</span>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={handlePwaInstallToggle}
                  disabled={isPwaInstalled}
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isPwaInstalled ? 'bg-success cursor-default' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPwaInstalled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-subtle focus:outline-none"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};
