import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { COUNTRIES, INDIAN_STATES, US_STATES } from '../constants';
import { useToast } from '../context/ToastContext';

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}

export interface AddressFormData {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates: { lat: number; lng: number } | null;
}

interface AddressFormProps {
  value: AddressFormData;
  onChange: (data: AddressFormData) => void;
  compact?: boolean;
}

// Lazy load Google Maps JS API (once per session)
let googleMapsLoaded = false;
let googleMapsLoading = false;
const googleMapsCallbacks: (() => void)[] = [];

function loadGoogleMapsApi(apiKey: string, callback: () => void) {
  if (googleMapsLoaded) { callback(); return; }
  googleMapsCallbacks.push(callback);
  if (googleMapsLoading) return;
  googleMapsLoading = true;

  window.initGoogleMapsCallback = () => {
    googleMapsLoaded = true;
    googleMapsCallbacks.forEach((cb) => cb());
    googleMapsCallbacks.length = 0;
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.warn('[AddressForm] Google Maps failed to load. Text inputs will be used.');
    googleMapsLoading = false;
    googleMapsCallbacks.forEach((cb) => cb());
    googleMapsCallbacks.length = 0;
  };
  document.head.appendChild(script);
}

function getStateList(country: string): string[] {
  if (country === 'India') return INDIAN_STATES;
  if (country === 'United States') return US_STATES;
  return [];
}

const normaliseCountry = (raw: string): string => {
  const map: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    IN: 'India',
    CA: 'Canada',
    AU: 'Australia',
  };
  if (['India','United States','Canada','United Kingdom','Australia'].includes(raw)) return raw;
  return map[raw] || 'India';
};

const inputCls = 'bg-background border border-borderCustom rounded-lg p-2 text-xs text-textDark focus:border-primary focus:outline-none w-full';
const labelCls = 'text-[10px] font-bold text-textDark uppercase tracking-wider';

export const AddressForm: React.FC<AddressFormProps> = ({ value, onChange, compact = false }) => {
  const { showToast } = useToast();
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mapsReady, setMapsReady] = useState(googleMapsLoaded);
  const [isFetching, setIsFetching] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasValidKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  /* Load Maps API */
  useEffect(() => {
    if (!hasValidKey) return;
    loadGoogleMapsApi(apiKey, () => setMapsReady(true));
  }, [apiKey, hasValidKey]);

  /* Attach Places Autocomplete after maps load */
  useEffect(() => {
    if (!mapsReady || !window.google?.maps?.places || !inputRef.current || autocompleteRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['address_components', 'formatted_address', 'geometry'],
    });
    autocompleteRef.current = ac;

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.address_components) return;

      const get = (type: string) =>
        place.address_components.find((c: any) => c.types.includes(type));

      const newAddr: AddressFormData = {
        addressLine: [get('street_number')?.long_name, get('route')?.long_name].filter(Boolean).join(' ')
          || place.formatted_address?.split(',')[0] || '',
        city: get('locality')?.long_name || get('postal_town')?.long_name || '',
        state: get('administrative_area_level_1')?.long_name || '',
        pincode: get('postal_code')?.long_name || '',
        country: normaliseCountry(get('country')?.long_name || get('country')?.short_name || 'India'),
        coordinates: place.geometry?.location
          ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          : null,
      };
      onChange(newAddr);
    });
  }, [mapsReady, onChange]);

  /* Fetch Current Location */
  const handleFetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }
    setIsFetching(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        const tryGoogle = async (): Promise<AddressFormData | null> => {
          if (!hasValidKey || !window.google?.maps) return null;
          const geocoder = new window.google.maps.Geocoder();
          return new Promise((res) => {
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
              if (status !== 'OK' || !results?.[0]) { res(null); return; }
              const comps = results[0].address_components;
              const get = (type: string) => comps.find((c: any) => c.types.includes(type));
              res({
                addressLine: [get('street_number')?.long_name, get('route')?.long_name].filter(Boolean).join(' ')
                  || results[0].formatted_address.split(',')[0],
                city: get('locality')?.long_name || get('postal_town')?.long_name || '',
                state: get('administrative_area_level_1')?.long_name || '',
                pincode: get('postal_code')?.long_name || '',
                country: normaliseCountry(get('country')?.long_name || 'India'),
                coordinates: { lat, lng },
              });
            });
          });
        };

        const tryNominatim = async (): Promise<AddressFormData | null> => {
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'CampusMarketplace/1.0' } }
            );
            if (!r.ok) return null;
            const data = await r.json();
            if (!data?.address) return null;
            const a = data.address;
            return {
              addressLine: [a.house_number, a.road || a.suburb || ''].filter(Boolean).join(', ')
                || data.display_name.split(',')[0],
              city: a.city || a.town || a.village || a.county || '',
              state: a.state || '',
              pincode: a.postcode || '',
              country: normaliseCountry(a.country || 'India'),
              coordinates: { lat, lng },
            };
          } catch { return null; }
        };

        try {
          const result = (await tryGoogle()) || (await tryNominatim());
          if (result) {
            onChange(result);
            showToast('Location fetched successfully!', 'success');
          } else {
            onChange({ ...value, coordinates: { lat, lng } });
            showToast('Coordinates captured. Please fill in address details.', 'info');
          }
        } catch (err) {
          console.error(err);
          onChange({ ...value, coordinates: { lat, lng } });
          showToast('Could not fetch full address. Please enter manually.', 'warning');
        } finally {
          setIsFetching(false);
        }
      },
      (err) => {
        console.error(err);
        showToast('Could not get your location. Check browser permissions.', 'danger');
        setIsFetching(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, [hasValidKey, onChange, showToast, value]);

  const stateList = getStateList(value.country);
  const gap = compact ? 'gap-2' : 'gap-3';

  return (
    <div className={`flex flex-col ${gap}`}>
      {/* Fetch Location Button */}
      <button
        type="button"
        onClick={handleFetchLocation}
        disabled={isFetching}
        className="flex items-center justify-center gap-2 w-full border border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold py-2.5 rounded-lg transition-colors focus:outline-none disabled:opacity-60"
      >
        {isFetching ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Navigation className="w-3.5 h-3.5" />
        )}
        {isFetching ? 'Fetching location...' : '📍 Use Current Location'}
      </button>

      <div className="flex items-center gap-2 text-[10px] text-muted">
        <div className="flex-1 h-px bg-borderCustom" />
        <span>or enter manually</span>
        <div className="flex-1 h-px bg-borderCustom" />
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Country</label>
        <select
          value={value.country}
          onChange={(e) => {
            const c = e.target.value;
            const sl = getStateList(c);
            onChange({ ...value, country: c, state: sl.length > 0 ? sl[0] : '' });
          }}
          className={inputCls}
        >
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Address Line */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>
          Address Line
          {hasValidKey && mapsReady && (
            <span className="ml-1 text-[9px] font-normal text-primary/80 normal-case"> — start typing for suggestions</span>
          )}
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Apartment, Street, Area..."
            value={value.addressLine}
            onChange={(e) => onChange({ ...value, addressLine: e.target.value })}
            className={`${inputCls} pl-8`}
            autoComplete="off"
          />
        </div>
      </div>

      {/* City */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>City / Town</label>
        <input
          type="text"
          placeholder="City or Town"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* State + Pincode row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>State / Province</label>
          {stateList.length > 0 ? (
            <select
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
              className={inputCls}
            >
              <option value="">Select state</option>
              {stateList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input
              type="text"
              placeholder="State / Province"
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
              className={inputCls}
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>{value.country === 'United States' ? 'ZIP Code' : 'Pincode'}</label>
          <input
            type="text"
            placeholder={value.country === 'United States' ? 'ZIP Code' : 'Pincode'}
            value={value.pincode}
            onChange={(e) => onChange({ ...value, pincode: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* GPS indicator */}
      {value.coordinates && (
        <div className="flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 border border-green-200 rounded-md px-2.5 py-1.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>GPS coordinates captured — distance to sellers will be accurate.</span>
        </div>
      )}
    </div>
  );
};
