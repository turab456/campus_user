import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';
import {
  searchPhoton,
  PhotonSuggestion,
  getCurrentCoordinates,
  reverseGeocodeNominatim,
} from '../services/osmService';

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation: (location: PhotonSuggestion) => void;
  placeholder?: string;
  className?: string;
  showCurrentLocationBtn?: boolean;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Search campus, street, city, or landmark…',
  className = '',
  showCurrentLocationBtn = true,
}) => {
  const [suggestions, setSuggestions] = useState<PhotonSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle query changes with 350ms debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchPhoton(value, 6);
      setSuggestions(results);
      setLoading(false);
      setIsOpen(true);
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: PhotonSuggestion) => {
    onChange(item.fullAddress);
    onSelectLocation(item);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleFetchCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const coords = await getCurrentCoordinates();
      const geocoded = await reverseGeocodeNominatim(coords.lat, coords.lng);
      const fullAddr = geocoded?.fullAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;

      const suggestion: PhotonSuggestion = {
        id: `current-loc-${coords.lat}-${coords.lng}`,
        name: geocoded?.addressLine || 'Current Location',
        fullAddress: fullAddr,
        city: geocoded?.city,
        state: geocoded?.state,
        country: geocoded?.country,
        postcode: geocoded?.pincode,
        coordinates: coords,
      };

      onChange(fullAddr);
      onSelectLocation(suggestion);
      setIsOpen(false);
    } catch (err: any) {
      console.error('[Current Location Error]', err);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-16 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none transition-colors"
          autoComplete="off"
        />
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {loading || isFetchingLocation ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setSuggestions([]);
                    setIsOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {showCurrentLocationBtn && (
                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-md transition-colors focus:outline-none"
                  title="Use Current Location"
                >
                  <Navigation className="w-3 h-3" />
                  <span className="hidden sm:inline">GPS</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-borderCustom rounded-xl shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
          {/* Top Option: Use Current Location */}
          <button
            type="button"
            onClick={handleFetchCurrentLocation}
            disabled={isFetchingLocation}
            className="w-full text-left px-3.5 py-2.5 bg-primary/5 hover:bg-primary/10 border-b border-borderCustom flex items-center gap-2.5 text-primary text-xs font-bold transition-colors focus:outline-none"
          >
            {isFetchingLocation ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
            ) : (
              <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
            )}
            <div className="flex-1">
              <span>{isFetchingLocation ? 'Detecting current GPS location…' : 'Use Current GPS Location'}</span>
              <p className="text-[10px] text-muted font-normal mt-0.5">Detect address & coordinates using browser GPS</p>
            </div>
          </button>

          {suggestions.length > 0 && (
            <>
              <div className="px-3 py-1 bg-slate-50 border-b border-borderCustom flex items-center justify-between text-[10px] text-muted font-bold tracking-wider uppercase">
                <span>Location Suggestions</span>
                <span className="text-[9px] font-normal text-primary/80">Powered by OpenStreetMap</span>
              </div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-primary/5 border-b border-slate-100 last:border-none flex items-start gap-2.5 transition-colors group focus:outline-none"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-textDark truncate">{item.name}</p>
                    <p className="text-[10px] text-muted truncate mt-0.5">{item.fullAddress}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {!loading && value.trim().length >= 2 && suggestions.length === 0 && (
            <div className="p-3 text-center text-xs text-muted">
              No locations found matching &ldquo;{value}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
