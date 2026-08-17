import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Trash2 } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageCompressor';

interface AiImageAnalysis {
  match: boolean;
  detected_category: string;
  item: string;
  confidence: number;
  reason: string;
  skipped?: boolean;
}

interface AiImageScannerProps {
  file: File;
  previewUrl: string;
  category: string;
  onRemove: () => void;
  onStatusChange?: (isValid: boolean, analysis?: AiImageAnalysis) => void;
}

const LOADING_MESSAGES = [
  'Uploading photo...',
  'Analyzing image...',
  'Checking item category...'
];

// Memory cache to prevent re-evaluating already verified files across re-renders
const validationCache = new Map<string, { isValid: boolean; analysis?: AiImageAnalysis }>();

export const AiImageScanner: React.FC<AiImageScannerProps> = ({
  file,
  previewUrl,
  category,
  onRemove,
  onStatusChange
}) => {
  const { showToast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [msgIndex, setMsgIndex] = useState(0);
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  // Cycle loading messages during analysis
  useEffect(() => {
    if (!isAnalyzing) return;
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  useEffect(() => {
    let isMounted = true;
    const fileId = `${file.name}-${file.size}-${file.lastModified}-${category}`;

    // Check if result is already in memory cache
    if (validationCache.has(fileId)) {
      const cached = validationCache.get(fileId)!;
      if (cached.isValid) {
        setIsAnalyzing(false);
        setIsVerifiedSuccess(true);
        setShowSuccessCheck(false);
        onStatusChange?.(true, cached.analysis);
        return;
      } else {
        onStatusChange?.(false, cached.analysis);
        onRemove();
        return;
      }
    }

    const runValidation = async () => {
      if (!category) {
        showToast('Please select a category first before adding photos.', 'warning');
        onRemove();
        return;
      }

      setIsAnalyzing(true);
      setShowSuccessCheck(false);
      setIsVerifiedSuccess(false);

      try {
        // Compress image to a lightweight 400px thumbnail (~25KB) for ultra-fast Vision AI processing
        const visionPayload = await compressImage(file, 400, 0.6).catch(() => file);
        const res = await api.validateImageCategory(visionPayload, category);
        if (!isMounted) return;

        if (res && res.success && res.analysis) {
          const { match, item, reason, detected_category } = res.analysis;

          if (match === false) {
            validationCache.set(fileId, { isValid: false, analysis: res.analysis });
            // Category mismatch: auto remove photo and trigger clear concise toast
            const formattedCat = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'selected category';
            const detectedItem = item ? item.toLowerCase().replace(/^(a|an|the)\s+/, '').trim() : '';
            const shortReason = detectedItem
              ? `Photo shows "${detectedItem}", not ${formattedCat}.`
              : `Photo does not match category ${formattedCat}.`;
            showToast(`Category Mismatch: ${shortReason}`, 'danger');
            onStatusChange?.(false, res.analysis);
            onRemove();
            return;
          }

          // Match Success
          validationCache.set(fileId, { isValid: true, analysis: res.analysis });
          setShowSuccessCheck(true);
          setIsVerifiedSuccess(true);
          onStatusChange?.(true, res.analysis);

          setTimeout(() => {
            if (isMounted) {
              setShowSuccessCheck(false);
              setIsAnalyzing(false);
            }
          }, 1000);
        } else {
          // Fallback pass
          setShowSuccessCheck(true);
          setIsVerifiedSuccess(true);
          onStatusChange?.(true);
          setTimeout(() => {
            if (isMounted) {
              setShowSuccessCheck(false);
              setIsAnalyzing(false);
            }
          }, 1000);
        }
      } catch (err: any) {
        console.warn('[AiImageScanner] API Error, skipping validation:', err);
        if (!isMounted) return;
        setIsVerifiedSuccess(true);
        setIsAnalyzing(false);
        onStatusChange?.(true);
      }
    };

    runValidation();

    return () => {
      isMounted = false;
    };
  }, [file, category]);

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm group transition-all duration-300">
      {/* Photo Preview */}
      <img
        src={previewUrl}
        alt="Listing preview"
        className="w-full h-full object-cover"
      />

      {/* Loading Overlay with Center AI Star Icon & Animated Text */}
      {(isAnalyzing || showSuccessCheck) && (
        <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center transition-all duration-300">
          {showSuccessCheck ? (
            /* Success State Icon */
            <div className="flex flex-col items-center gap-2 animate-in zoom-in-75 duration-300">
              <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Photo Verified</span>
            </div>
          ) : (
            /* Analyzing State with Center Rotating AI Star Icon & Cycling Text */
            <div className="flex flex-col items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-teal-400/20 blur-sm animate-pulse" />
                <Sparkles className="w-8 h-8 text-teal-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <span className="text-xs font-semibold text-white tracking-wide animate-pulse">
                {LOADING_MESSAGES[msgIndex]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Persistent Top Right Actions when Idle / Verified */}
      {!isAnalyzing && !showSuccessCheck && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {isVerifiedSuccess && (
            <div className="bg-emerald-600/90 text-white p-1 rounded-full shadow-md backdrop-blur-sm" title="AI Verified">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="bg-slate-900/70 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md backdrop-blur-sm transition-colors"
            title="Remove photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
