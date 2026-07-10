import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, Navigation, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// ── Global Google Maps types ──────────────────────────────────────────────
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}

// ── Exported types ────────────────────────────────────────────────────────
export interface AddressFormData {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  countryCode: string;
  coordinates: { lat: number; lng: number } | null;
}

interface AddressFormProps {
  value: AddressFormData;
  onChange: (data: AddressFormData) => void;
  compact?: boolean;
}

interface CountryOption {
  name: string;
  cca2: string;
}

// ── Google Maps lazy loader ───────────────────────────────────────────────
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
    console.warn('[AddressForm] Google Maps failed to load.');
    googleMapsLoading = false;
    googleMapsCallbacks.forEach((cb) => cb());
    googleMapsCallbacks.length = 0;
  };
  document.head.appendChild(script);
}

// ── Country list (REST Countries API) ────────────────────────────────────
let cachedCountries: CountryOption[] | null = null;

async function fetchCountries(): Promise<CountryOption[]> {
  if (cachedCountries) return cachedCountries;
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    if (data.error || !data.data) throw new Error('failed');
    const list = data.data
      .map((c: any) => ({ name: c.name, cca2: c.Iso2 }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    cachedCountries = list;
    return list;
  } catch {
    return [
      { name: 'India', cca2: 'IN' },
      { name: 'United States', cca2: 'US' },
      { name: 'Canada', cca2: 'CA' },
      { name: 'United Kingdom', cca2: 'GB' },
      { name: 'Australia', cca2: 'AU' },
    ];
  }
}

// ── State list (CountriesNow API) ─────────────────────────────────────────
const stateCache: Record<string, string[]> = {};

async function fetchStates(countryName: string): Promise<string[]> {
  if (!countryName) return [];
  if (stateCache[countryName] !== undefined) return stateCache[countryName];
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    });
    const data = await res.json();
    if (data.error || !data.data?.states?.length) {
      stateCache[countryName] = [];
      return [];
    }
    const list: string[] = (data.data.states as { name: string }[])
      .map((s) => s.name)
      .sort();
    stateCache[countryName] = list;
    return list;
  } catch {
    stateCache[countryName] = [];
    return [];
  }
}

// ── Styles ────────────────────────────────────────────────────────────────
const inputCls =
  'bg-background border border-borderCustom rounded-lg p-2 text-xs text-textDark focus:border-primary focus:outline-none w-full';
const labelCls = 'text-[10px] font-bold text-textDark uppercase tracking-wider';

// ── Component ─────────────────────────────────────────────────────────────
export const AddressForm: React.FC<AddressFormProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const { showToast } = useToast();
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mapsReady, setMapsReady] = useState(googleMapsLoaded);
  const [isFetching, setIsFetching] = useState(false);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [states, setStates] = useState<string[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasValidKey = Boolean(apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE');

  // Load Google Maps API
  useEffect(() => {
    if (!hasValidKey) return;
    loadGoogleMapsApi(apiKey, () => setMapsReady(true));
  }, [apiKey, hasValidKey]);

  // Attach Places Autocomplete once Maps is ready
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

      const cca2: string = get('country')?.short_name || '';
      const countryLong: string = get('country')?.long_name || value.country;
      const matched = cachedCountries?.find((c) => c.cca2 === cca2);

      onChange({
        addressLine:
          [get('street_number')?.long_name, get('route')?.long_name]
            .filter(Boolean)
            .join(' ') ||
          place.formatted_address?.split(',')[0] ||
          '',
        city:
          get('locality')?.long_name || get('postal_town')?.long_name || '',
        state: get('administrative_area_level_1')?.long_name || '',
        pincode: get('postal_code')?.long_name || '',
        country: matched?.name || countryLong,
        countryCode: cca2,
        coordinates: place.geometry?.location
          ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }
          : null,
      });
    });
  }, [mapsReady, onChange, value.country]);

  // Fetch country list on mount
  useEffect(() => {
    fetchCountries().then((list) => {
      setCountries(list);
      setCountriesLoading(false);
    });
  }, []);

  // Resolve countryCode when country is pre-filled from saved profile
  useEffect(() => {
    if (!value.country || value.countryCode || countries.length === 0) return;
    const found = countries.find((c) => c.name === value.country);
    if (found) {
      onChange({ ...value, countryCode: found.cca2 });
    }
  }, [countries, value, onChange]);

  // Fetch state list whenever country changes
  useEffect(() => {
    if (!value.country) { setStates([]); return; }
    setStatesLoading(true);
    setStates([]);
    fetchStates(value.country).then((list) => {
      setStates(list);
      setStatesLoading(false);
    });
  }, [value.country]);

  // Handle country dropdown change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const found = countries.find((c) => c.name === name);
    onChange({ ...value, country: name, countryCode: found?.cca2 || '', state: '' });
  };

  // Fetch Current Location
  const handleFetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }
    setIsFetching(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        // Try Google Geocoder first
        const tryGoogle = async (): Promise<Partial<AddressFormData> | null> => {
          if (!hasValidKey || !window.google?.maps) return null;
          const geocoder = new window.google.maps.Geocoder();
          return new Promise((resolve) => {
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
              if (status !== 'OK' || !results?.[0]) { resolve(null); return; }
              const comps = results[0].address_components;
              const get = (type: string) => comps.find((c: any) => c.types.includes(type));
              const cca2 = get('country')?.short_name || '';
              const countryLong = get('country')?.long_name || '';
              const matched = cachedCountries?.find((c) => c.cca2 === cca2);
              resolve({
                addressLine:
                  [get('street_number')?.long_name, get('route')?.long_name]
                    .filter(Boolean).join(' ') ||
                  results[0].formatted_address?.split(',')[0] || '',
                city: get('locality')?.long_name || get('postal_town')?.long_name || '',
                state: get('administrative_area_level_1')?.long_name || '',
                pincode: get('postal_code')?.long_name || '',
                country: matched?.name || countryLong,
                countryCode: cca2,
                coordinates: { lat, lng },
              });
            });
          });
        };

        // Fallback: Nominatim (OpenStreetMap)
        const tryNominatim = async (): Promise<Partial<AddressFormData> | null> => {
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'CampusMarketplace/1.0' } }
            );
            if (!r.ok) return null;
            const data = await r.json();
            if (!data?.address) return null;
            const a = data.address;
            const countryName: string = a.country || '';
            const matched = cachedCountries?.find(
              (c) => c.name.toLowerCase() === countryName.toLowerCase()
            );
            return {
              addressLine:
                [a.house_number, a.road || a.suburb || ''].filter(Boolean).join(', ') ||
                data.display_name?.split(',')[0] || '',
              city: a.city || a.town || a.village || a.county || '',
              state: a.state || '',
              pincode: a.postcode || '',
              country: matched?.name || countryName,
              countryCode: matched?.cca2 || '',
              coordinates: { lat, lng },
            };
          } catch {
            return null;
          }
        };

        try {
          const result = (await tryGoogle()) || (await tryNominatim());
          if (result) {
            onChange({ ...value, ...result, coordinates: { lat, lng } });
            showToast('Location fetched successfully!', 'success');
          } else {
            onChange({ ...value, coordinates: { lat, lng } });
            showToast('Coordinates captured — please fill in address fields.', 'info');
          }
        } catch {
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

  const gap = compact ? 'gap-2' : 'gap-3';

  return (
    <div className={`flex flex-col ${gap}`}>
      {/* ── Use Current Location ─────────────────────────── */}
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
        {isFetching ? 'Fetching location...' : 'Use Current Location'}
      </button>

      <div className="flex items-center gap-2 text-[10px] text-muted">
        <div className="flex-1 h-px bg-borderCustom" />
        <span>or enter manually</span>
        <div className="flex-1 h-px bg-borderCustom" />
      </div>

      {/* ── Country Dropdown ─────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Country</label>
        <div className="relative">
          <select
            value={value.country}
            onChange={handleCountryChange}
            disabled={countriesLoading}
            className={`${inputCls} appearance-none pr-7 ${countriesLoading ? 'text-muted' : ''}`}
          >
            {countriesLoading ? (
              <option>Loading countries…</option>
            ) : (
              <>
                <option value="">— Select country —</option>
                {countries.map((c) => (
                  <option key={c.cca2} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {countriesLoading ? (
            <Loader2 className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 animate-spin pointer-events-none" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          )}
        </div>
      </div>

      {/* ── Address Line (Google Places Autocomplete) ────── */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>
          Address Line
          {hasValidKey && mapsReady && (
            <span className="ml-1 text-[9px] font-normal text-primary/80 normal-case">
              — start typing for suggestions
            </span>
          )}
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Apartment, Street, Area…"
            value={value.addressLine}
            onChange={(e) => onChange({ ...value, addressLine: e.target.value })}
            className={`${inputCls} pl-8`}
            autoComplete="off"
          />
        </div>
      </div>

      {/* ── City ─────────────────────────────────────────── */}
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

      {/* ── State + Pincode ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {/* State */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>State / Province</label>
          {statesLoading ? (
            <div className="flex items-center gap-2 border border-borderCustom rounded-lg p-2 bg-background text-xs text-muted">
              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
              <span>Loading…</span>
            </div>
          ) : states.length > 0 ? (
            <div className="relative">
              <select
                value={value.state}
                onChange={(e) => onChange({ ...value, state: e.target.value })}
                className={`${inputCls} appearance-none pr-7`}
              >
                <option value="">— Select state —</option>
                {(value.state && !states.includes(value.state)
                  ? [value.state, ...states]
                  : states
                ).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
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

        {/* Pincode */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>
            {value.countryCode === 'US' ? 'ZIP Code' : 'Pincode'}
          </label>
          <input
            type="text"
            placeholder={value.countryCode === 'US' ? 'ZIP Code' : 'Pincode'}
            value={value.pincode}
            onChange={(e) => onChange({ ...value, pincode: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* ── GPS indicator ─────────────────────────────────── */}
      {value.coordinates && (
        <div className="flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 border border-green-200 rounded-md px-2.5 py-1.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>GPS captured — distances to sellers will be accurate.</span>
        </div>
      )}
    </div>
  );
};