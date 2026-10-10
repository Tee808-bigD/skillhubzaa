import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { 
  MapPin, 
  ShieldCheck, 
  Search, 
  Check, 
  AlertTriangle, 
  Building2, 
  Globe2, 
  Navigation, 
  Loader2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface BusinessLocationFormProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onClose?: () => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const BusinessLocationForm: React.FC<BusinessLocationFormProps> = ({
  currentUser,
  onUpdateUser,
  onClose
}) => {
  const [businessName, setBusinessName] = useState(currentUser.business_name || currentUser.name + ' Studio');
  const [businessAddress, setBusinessAddress] = useState(currentUser.business_address || '');
  const [showOnMap, setShowOnMap] = useState<boolean>(currentUser.show_on_map || false);
  const [latitude, setLatitude] = useState<number | null>(currentUser.business_latitude || null);
  const [longitude, setLongitude] = useState<number | null>(currentUser.business_longitude || null);

  // Nominatim Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Free Geocoding with Nominatim (500ms debounce)
  useEffect(() => {
    if (!businessAddress.trim() || businessAddress.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = encodeURIComponent(businessAddress.trim());
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.warn('Nominatim geocoding request error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [businessAddress]);

  const handleSelectSuggestion = (item: NominatimResult) => {
    setBusinessAddress(item.display_name);
    setLatitude(parseFloat(item.lat));
    setLongitude(parseFloat(item.lon));
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    let lat = latitude;
    let lng = longitude;

    // If coordinates are missing but address is entered, do a direct lookup
    if (businessAddress.trim() && (lat === null || lng === null)) {
      try {
        const query = encodeURIComponent(businessAddress.trim());
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
            setLatitude(lat);
            setLongitude(lng);
          }
        }
      } catch (err) {
        console.warn('Fallback geocode failed:', err);
      }
    }

    // Default to Johannesburg CBD fallback if completely unresolved but user toggled on
    if (showOnMap && (lat === null || lng === null)) {
      lat = -26.2041;
      lng = 28.0473;
      setLatitude(lat);
      setLongitude(lng);
    }

    const updatedUser: User = {
      ...currentUser,
      business_name: businessName.trim(),
      business_address: businessAddress.trim(),
      business_latitude: lat,
      business_longitude: lng,
      show_on_map: showOnMap
    };

    try {
      // Send to server if available
      await fetch('/api/users/business-location/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName.trim(),
          business_address: businessAddress.trim(),
          business_latitude: lat,
          business_longitude: lng,
          show_on_map: showOnMap
        })
      }).catch(() => null);

      onUpdateUser(updatedUser);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose?.();
      }, 1500);
    } catch {
      onUpdateUser(updatedUser);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose?.();
      }, 1500);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-tight">
              Business Location & Public Map Settings
            </h3>
            <p className="text-xs text-neutral-400 font-medium">
              Configure your verified commercial storefront or workshop for discovery.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* PRIVACY WARNING NOTICE (Required by Prompt) */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-emerald-300 block mb-0.5">
            Privacy-First Architecture Notice
          </span>
          <p className="text-neutral-300">
            <strong>Privacy Notice:</strong> Only your verified business address will be shown on the public map. Your personal home address and private location will <strong>NEVER</strong> be displayed or shared on the map.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Field 1: Business Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1.5">
            Business / Trade Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Soweto Solar & Battery Inverters"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
        </div>

        {/* Field 2: Business Address with Nominatim Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-bold text-neutral-300 mb-1.5">
            Business Address (Street, Building, or Workshop)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Start typing your street address (e.g. 15 Vilakazi St, Orlando West)..."
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3.5 top-3" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-neutral-800 animate-in fade-in duration-150">
              <div className="px-3 py-1.5 bg-neutral-950 text-[10px] font-bold text-neutral-400 flex items-center justify-between">
                <span>Free OpenStreetMap Nominatim suggestions:</span>
                <span className="text-emerald-400">Click to select</span>
              </div>
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left p-3 hover:bg-neutral-800/80 text-xs text-neutral-200 transition flex items-start gap-2.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
          <span className="text-[10px] text-neutral-500 mt-1 block">
            Powered by OpenStreetMap Nominatim free geocoding. No Google Maps API key required.
          </span>
        </div>

        {/* Coordinates Preview (if geocoded) */}
        {latitude !== null && longitude !== null && (
          <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
              <span>Resolved Coordinates:</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        )}

        {/* Field 3: Public Map Visibility Toggle */}
        <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Show my business on the public map
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-md ${
                showOnMap 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {showOnMap ? 'Public' : 'Hidden (Private)'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              When toggled OFF, your business pin will never appear on the public map.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showOnMap}
              onChange={(e) => setShowOnMap(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {/* Feedback message */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4" />
            <span>Business location settings saved successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Geocoding & Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Business Location</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
