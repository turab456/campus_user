import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../hooks/usePWA';
import { useWebPush } from '../hooks/useWebPush';
import { Modal } from './Modal';
import { Bell, Smartphone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const AppSetupModal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isInstallable, isStandalone, installApp } = usePWA();
  const { permission, requestPushPermission } = useWebPush();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(permission === 'granted');
  const [isPwaInstalled, setIsPwaInstalled] = useState(
    isStandalone || localStorage.getItem('pwa_installed') === 'true'
  );

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

    const needsNotifications = permission === 'default';
    const needsPwa = isInstallable && !isStandalone && localStorage.getItem('pwa_installed') !== 'true';

    // Open if there is something pending to setup
    if (needsNotifications || needsPwa) {
      setIsOpen(true);
    }
  }, [user, permission, isInstallable, isStandalone]);

  // Synchronize state when hook permissions update
  useEffect(() => {
    setIsNotificationsEnabled(permission === 'granted');
  }, [permission]);

  useEffect(() => {
    setIsPwaInstalled(isStandalone || localStorage.getItem('pwa_installed') === 'true');
  }, [isStandalone]);

  const handleNotificationToggle = async () => {
    if (isNotificationsEnabled) return; // Cannot turn off directly from PWA UI (must be settings)
    
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

  const handleClose = () => {
    sessionStorage.setItem('setup_modal_dismissed', 'true');
    setIsOpen(false);
  };

  // If there are no actionable toggles to show, just don't render
  const showNotificationSection = permission === 'default';
  const showPwaSection = isInstallable && !isStandalone && localStorage.getItem('pwa_installed') !== 'true';

  if (!showNotificationSection && !showPwaSection) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete App Setup" maxWidth="sm">
      <div className="flex flex-col gap-5">
        <p className="text-xs text-muted leading-relaxed">
          Enhance your Campus Marketplace experience by configuring push notifications and installing the PWA.
        </p>

        <div className="flex flex-col gap-4">
          {/* Notification Prompt */}
          {showNotificationSection && (
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
          {showPwaSection && (
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
    </Modal>
  );
};
