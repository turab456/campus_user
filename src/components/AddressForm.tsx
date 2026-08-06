import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Loader2, Navigation, ChevronDown, Map as MapIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  getCurrentCoordinates,
  reverseGeocodeNominatim,
  PhotonSuggestion,
} from '../services/osmService';
import { LocationSearchInput } from './LocationSearchInput';
import { LocationPickerMap } from './LocationPickerMap';

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
  const [isFetching, setIsFetching] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [states, setStates] = useState<string[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);

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

  // Fetch Current Location using Browser Geolocation + OpenStreetMap Nominatim Reverse Geocoding
  const handleFetchLocation = useCallback(async () => {
    setIsFetching(true);
    try {
      const coords = await getCurrentCoordinates();
      const geocoded = await reverseGeocodeNominatim(coords.lat, coords.lng);

      if (geocoded) {
        const matchedCountry = countries.find(
          (c) => c.name.toLowerCase() === geocoded.country.toLowerCase() || c.cca2 === geocoded.countryCode
        );

        onChange({
          ...value,
          addressLine: geocoded.addressLine || value.addressLine,
          city: geocoded.city || value.city,
          state: geocoded.state || value.state,
          pincode: geocoded.pincode || value.pincode,
          country: matchedCountry?.name || geocoded.country || value.country,
          countryCode: matchedCountry?.cca2 || geocoded.countryCode || value.countryCode,
          coordinates: { lat: coords.lat, lng: coords.lng },
        });
        showToast('Location and address detected via OpenStreetMap!', 'success');
      } else {
        onChange({ ...value, coordinates: { lat: coords.lat, lng: coords.lng } });
        showToast('Coordinates captured — please fill in remaining address fields.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not get location.', 'danger');
    } finally {
      setIsFetching(false);
    }
  }, [countries, onChange, showToast, value]);

  // Handle selecting a location suggestion from Photon Autocomplete
  const handleSelectPhotonSuggestion = (suggestion: PhotonSuggestion) => {
    const matchedCountry = countries.find(
      (c) => (suggestion.country && c.name.toLowerCase() === suggestion.country.toLowerCase())
    );

    onChange({
      ...value,
      addressLine: suggestion.street || suggestion.name || suggestion.fullAddress,
      city: suggestion.city || value.city,
      state: suggestion.state || value.state,
      pincode: suggestion.postcode || value.pincode,
      country: matchedCountry?.name || suggestion.country || value.country,
      countryCode: matchedCountry?.cca2 || value.countryCode,
      coordinates: suggestion.coordinates,
    });
    showToast('Location selected!', 'success');
  };

  // Handle dragging pin marker on Leaflet map
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    const geocoded = await reverseGeocodeNominatim(lat, lng);
    if (geocoded) {
      const matchedCountry = countries.find(
        (c) => c.name.toLowerCase() === geocoded.country.toLowerCase() || c.cca2 === geocoded.countryCode
      );

      onChange({
        ...value,
        addressLine: geocoded.addressLine || value.addressLine,
        city: geocoded.city || value.city,
        state: geocoded.state || value.state,
        pincode: geocoded.pincode || value.pincode,
        country: matchedCountry?.name || geocoded.country || value.country,
        countryCode: matchedCountry?.cca2 || geocoded.countryCode || value.countryCode,
        coordinates: { lat, lng },
      });
      showToast('Pin position updated!', 'info');
    } else {
      onChange({ ...value, coordinates: { lat, lng } });
    }
  };

  const gap = compact ? 'gap-2' : 'gap-3';

  return (
    <div className={`flex flex-col ${gap}`}>
      {/* ── Use Current Location Button ─────────────────────────── */}
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

      {/* ── Address Line (Photon OpenStreetMap Autocomplete) ────── */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>
          Address Line
          <span className="ml-1 text-[9px] font-normal text-primary/80 normal-case">
            — start typing for OpenStreetMap suggestions
          </span>
        </label>
        <LocationSearchInput
          value={value.addressLine}
          onChange={(val) => onChange({ ...value, addressLine: val })}
          onSelectLocation={handleSelectPhotonSuggestion}
          placeholder="Apartment, Street, Area…"
        />
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

      {/* ── GPS Captured Indicator & Leaflet Interactive Map ───── */}
      {value.coordinates && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-md px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span>
                GPS captured ({value.coordinates.lat.toFixed(4)}, {value.coordinates.lng.toFixed(4)})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1 font-bold text-primary hover:underline focus:outline-none"
            >
              <MapIcon className="w-3 h-3" />
              {showMap ? 'Hide Map' : 'Adjust Pin on Map'}
            </button>
          </div>

          {showMap && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-muted font-medium">
                Drag the marker or click anywhere on the OpenStreetMap to adjust your location:
              </span>
              <LocationPickerMap
                center={value.coordinates}
                draggable={true}
                onLocationSelect={handleMapLocationSelect}
                className="h-56 w-full rounded-lg border border-borderCustom"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};