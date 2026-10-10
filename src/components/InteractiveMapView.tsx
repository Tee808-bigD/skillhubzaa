import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CommunityEvent, YouthService, User } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BusinessLocationForm } from './BusinessLocationForm';
import { 
  MapPin as MapPinIcon, 
  Navigation, 
  Sliders, 
  Search, 
  ShieldCheck, 
  Star, 
  Compass, 
  Plus, 
  Building2, 
  RotateCcw, 
  ExternalLink,
  Layers,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

interface InteractiveMapViewProps {
  events?: CommunityEvent[];
  services?: YouthService[];
  currentUser?: User;
  onUpdateUser?: (updatedUser: User) => void;
  onSelectEvent?: (event: CommunityEvent) => void;
  onSelectService?: (service: YouthService) => void;
  onOpenProfile?: (username: string) => void;
}

interface MapItem {
  id: string;
  type: 'business' | 'service' | 'event';
  title: string;
  businessName: string;
  ownerName: string;
  avatar: string;
  category: string;
  rating: number;
  lat: number;
  lng: number;
  address?: string;
  priceText?: string;
  data: any;
}

// Haversine formula to compute distance in km between two lat/lng coordinates
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Initial default center: Johannesburg, South Africa
const DEFAULT_CENTER: [number, number] = [-26.2041, 28.0473];
const DEFAULT_ZOOM = 11;

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  events = [],
  services = [],
  currentUser,
  onUpdateUser,
  onSelectEvent,
  onSelectService,
  onOpenProfile
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const hasAutoFittedOnMountRef = useRef<boolean>(false);

  // Dynamic API pins fetched from backend /api/map/pins/
  const [apiPins, setApiPins] = useState<MapItem[]>([]);

  // Filter & Radius State
  const [filterType, setFilterType] = useState<'all' | 'services' | 'events'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(35);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_ZOOM);
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
  const [hasMovedCenter, setHasMovedCenter] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch dynamic pins from /api/map/pins on mount
  useEffect(() => {
    fetch('/api/map/pins')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.results)) {
          const mapped: MapItem[] = data.results.map((p: any) => ({
            id: p.id || `usr_pin_${Math.random()}`,
            type: 'business',
            title: p.business_name || 'Verified Workshop',
            businessName: p.business_name || 'Verified Workshop',
            ownerName: p.username || 'Artisan',
            avatar: p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            category: p.category || 'Artisan & Tech',
            rating: p.rating || 5.0,
            lat: Number(p.business_latitude),
            lng: Number(p.business_longitude),
            data: p
          }));
          setApiPins(mapped);
        }
      })
      .catch(() => {
        // Fallback to client state
      });
  }, []);

  // Base list of privacy-verified public pins
  const allMapItems = useMemo<MapItem[]>(() => {
    const list: MapItem[] = [];
    const seenIds = new Set<string>();

    // 1. Current user if they have designated a public business location
    if (
      currentUser && 
      currentUser.show_on_map && 
      currentUser.business_latitude && 
      currentUser.business_longitude
    ) {
      const uId = `usr_${currentUser.id}`;
      seenIds.add(uId);
      list.push({
        id: uId,
        type: 'business',
        title: currentUser.business_name || `${currentUser.name} Studio`,
        businessName: currentUser.business_name || `${currentUser.name} Studio`,
        ownerName: currentUser.name,
        avatar: currentUser.avatar,
        category: currentUser.skills?.[0] || 'Artisan & Tech Services',
        rating: currentUser.rating || 5.0,
        lat: Number(currentUser.business_latitude),
        lng: Number(currentUser.business_longitude),
        address: currentUser.business_address,
        priceText: currentUser.hourlyRate ? `${currentUser.hourlyRate}` : undefined,
        data: currentUser
      });
    }

    // 2. Pins from API
    apiPins.forEach(p => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        list.push(p);
      }
    });

    // 3. Services with designated business/workshop coordinates (Gauteng, Cape Town, KZN)
    const serviceCoordinates = [
      { lat: -26.2041, lng: 28.0473, loc: 'Braamfontein, JHB' },
      { lat: -26.2678, lng: 27.8585, loc: 'Vilakazi St, Soweto' },
      { lat: -26.1458, lng: 28.0444, loc: 'Rosebank, JHB' },
      { lat: -25.7479, lng: 28.2293, loc: 'Pretoria Central' },
      { lat: -26.1076, lng: 28.0567, loc: 'Sandton City' },
      { lat: -33.9249, lng: 18.4241, loc: 'Bree Street, Cape Town' },
      { lat: -29.8587, lng: 31.0218, loc: 'Florida Rd, Durban' }
    ];

    services.forEach((s, idx) => {
      const sId = `srv_${s.id}`;
      if (!seenIds.has(sId)) {
        seenIds.add(sId);
        const coord = serviceCoordinates[idx % serviceCoordinates.length];
        list.push({
          id: sId,
          type: 'service',
          title: s.title,
          businessName: `${s.providerName}'s Workshop`,
          ownerName: s.providerName,
          avatar: s.providerAvatar,
          category: s.category.replace('_', ' ').toUpperCase(),
          rating: s.rating,
          lat: coord.lat + (idx * 0.005),
          lng: coord.lng + (idx * 0.005),
          address: coord.loc,
          priceText: `R${s.priceZar} / ${s.priceUnit}`,
          data: s
        });
      }
    });

    // 4. Events with public venues
    const eventCoordinates = [
      { lat: -26.1929, lng: 28.0305, loc: 'Tshimologong Tech Zone, Braamfontein' },
      { lat: -26.2361, lng: 27.9152, loc: 'Diepkloof Community Hall, Soweto' },
      { lat: -25.7545, lng: 28.1928, loc: 'Pretoria Arts & Tech Pavilion' },
      { lat: -33.9312, lng: 18.4608, loc: 'Woodstock Exchange, Cape Town' }
    ];

    events.forEach((e, idx) => {
      const eId = `evt_${e.id}`;
      if (!seenIds.has(eId)) {
        seenIds.add(eId);
        const coord = eventCoordinates[idx % eventCoordinates.length];
        list.push({
          id: eId,
          type: 'event',
          title: e.title,
          businessName: e.title,
          ownerName: e.location,
          avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&auto=format&fit=crop&q=80',
          category: 'Tech & Artisan Summit',
          rating: 4.9,
          lat: coord.lat,
          lng: coord.lng,
          address: e.location,
          priceText: e.dateBadge,
          data: e
        });
      }
    });

    return list;
  }, [services, events, currentUser, apiPins]);

  // Total dataset pin availability flag
  const hasAnyPins = allMapItems.length > 0;

  // Filter items matching selected category tab (all / services / events)
  const matchingTypePins = useMemo(() => {
    return allMapItems.filter(item => {
      if (filterType === 'services' && item.type === 'event') return false;
      if (filterType === 'events' && item.type !== 'event') return false;
      return true;
    });
  }, [allMapItems, filterType]);

  // Pins strictly within the specified radius from current center
  const visiblePinsInRadius = useMemo(() => {
    return matchingTypePins.filter(item => {
      const distance = calculateDistanceKm(
        currentCenter[0],
        currentCenter[1],
        item.lat,
        item.lng
      );
      return distance <= radiusKm;
    });
  }, [matchingTypePins, currentCenter, radiusKm]);

  // Pins visible within current map viewport bounding box
  const visiblePinsInViewport = useMemo(() => {
    if (!currentBounds) return visiblePinsInRadius;
    return matchingTypePins.filter(item => {
      return currentBounds.contains([item.lat, item.lng]);
    });
  }, [matchingTypePins, currentBounds, visiblePinsInRadius]);

  // "Show All Pins" action that fits bounds to all pins
  const handleFitAllPins = () => {
    const map = mapInstanceRef.current;
    const targetPins = matchingTypePins.length > 0 ? matchingTypePins : allMapItems;
    if (!map || targetPins.length === 0) return;

    if (targetPins.length === 1) {
      map.flyTo([targetPins[0].lat, targetPins[0].lng], 12, { duration: 1.2 });
      setCurrentCenter([targetPins[0].lat, targetPins[0].lng]);
    } else {
      const bounds = L.latLngBounds(
        targetPins.map(item => [item.lat, item.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      const center = bounds.getCenter();
      setCurrentCenter([center.lat, center.lng]);
    }
    setHasMovedCenter(false);
  };

  // Initialize Leaflet Map with OpenStreetMap Standard Tiles + CSS Dark Filter
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true
    });

    // Standard OpenStreetMap tile layer (100% free, no API key required)
    // Dark theme is applied via CSS filter on .leaflet-tile-pane
    const osmTiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }
    );
    osmTiles.addTo(map);

    // Zoom controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create marker layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Track user drag / panning
    map.on('moveend', () => {
      const center = map.getCenter();
      setCurrentCenter([center.lat, center.lng]);
      setCurrentBounds(map.getBounds());
      setHasMovedCenter(true);
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
      setCurrentBounds(map.getBounds());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Auto-bounds on Mount: Automatically zooms out to show all pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || allMapItems.length === 0 || hasAutoFittedOnMountRef.current) return;

    if (allMapItems.length === 1) {
      map.setView([allMapItems[0].lat, allMapItems[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(
        allMapItems.map(item => [item.lat, item.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
    hasAutoFittedOnMountRef.current = true;
  }, [allMapItems]);

  // Update Markers, Clustering & Radius Circle on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Clear existing markers
    markersGroup.clearLayers();

    // Render Radius Circle around current center (emerald theme)
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }
    const circle = L.circle(currentCenter, {
      radius: radiusKm * 1000,
      color: '#10b981',
      weight: 1.5,
      opacity: 0.6,
      fillColor: '#10b981',
      fillOpacity: 0.05,
      dashArray: '4, 8'
    });
    circle.addTo(map);
    radiusCircleRef.current = circle;

    // Clustering: When zoomed out (zoom <= 8), group nearby pins into an emerald cluster
    const shouldCluster = currentZoom <= 8;

    if (shouldCluster && visiblePinsInRadius.length > 2) {
      // Group pins into geographic clusters (within 55km)
      const clusters: { center: [number, number]; items: MapItem[] }[] = [];
      visiblePinsInRadius.forEach(item => {
        const existing = clusters.find(c => {
          return calculateDistanceKm(c.center[0], c.center[1], item.lat, item.lng) < 55;
        });
        if (existing) {
          existing.items.push(item);
        } else {
          clusters.push({ center: [item.lat, item.lng], items: [item] });
        }
      });

      clusters.forEach(cluster => {
        if (cluster.items.length > 1) {
          // Render Emerald Cluster Icon
          const clusterIconHtml = `
            <div class="group cursor-pointer select-none">
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950 border border-emerald-300 shadow-xl shadow-emerald-500/30 transition-transform hover:scale-110 active:scale-95">
                <span class="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
                <span class="font-extrabold text-slate-950 whitespace-nowrap">${cluster.items.length} Pins</span>
              </div>
              <div class="w-1.5 h-1.5 mx-auto -mt-0.5 rotate-45 bg-emerald-500"></div>
            </div>
          `;

          const clusterDivIcon = L.divIcon({
            html: clusterIconHtml,
            className: 'custom-emerald-cluster',
            iconSize: [90, 32],
            iconAnchor: [45, 32]
          });

          const clusterMarker = L.marker(cluster.center, { icon: clusterDivIcon });
          clusterMarker.on('click', () => {
            const clusterBounds = L.latLngBounds(
              cluster.items.map(it => [it.lat, it.lng] as [number, number])
            );
            map.fitBounds(clusterBounds, { padding: [40, 40], maxZoom: 14 });
          });

          markersGroup.addLayer(clusterMarker);
        } else {
          // Single item in cluster
          renderIndividualMarker(cluster.items[0], markersGroup);
        }
      });
    } else {
      // Zoomed in: Render all individual custom emerald DivIcon markers
      visiblePinsInRadius.forEach(item => {
        renderIndividualMarker(item, markersGroup);
      });
    }
  }, [visiblePinsInRadius, currentCenter, radiusKm, currentZoom]);

  // Helper to render individual emerald pill markers with custom popups
  const renderIndividualMarker = (item: MapItem, group: L.LayerGroup) => {
    const isEvent = item.type === 'event';
    const truncatedTitle = item.title.length > 20 ? item.title.substring(0, 18) + '...' : item.title;

    const customIconHtml = `
      <div class="group cursor-pointer select-none">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border shadow-lg transition-transform hover:scale-110 active:scale-95 ${
          isEvent
            ? 'bg-purple-950/90 text-purple-300 border-purple-500/50 shadow-purple-500/20'
            : 'bg-slate-950/90 text-emerald-400 border-emerald-500/60 shadow-emerald-500/25'
        }">
          <span class="w-2 h-2 rounded-full ${isEvent ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}"></span>
          <span class="truncate max-w-[120px] font-bold text-white drop-shadow-xs">${truncatedTitle}</span>
        </div>
        <div class="w-1.5 h-1.5 mx-auto -mt-0.5 rotate-45 ${isEvent ? 'bg-purple-500' : 'bg-emerald-500'}"></div>
      </div>
    `;

    const divIcon = L.divIcon({
      html: customIconHtml,
      className: 'custom-emerald-pin',
      iconSize: [140, 36],
      iconAnchor: [70, 36]
    });

    const marker = L.marker([item.lat, item.lng], { icon: divIcon });

    const popupHtml = `
      <div style="background: #18181b; color: #f4f4f5; border: 1px solid #27272a; border-radius: 16px; padding: 14px; min-width: 220px; font-family: inherit;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <img src="${item.avatar}" style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover; border: 1px solid #10b981;" />
          <div style="overflow: hidden;">
            <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${item.businessName}
            </h4>
            <span style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase;">
              ${item.category}
            </span>
          </div>
        </div>
        <p style="margin: 0 0 10px 0; font-size: 11px; color: #a1a1aa; line-height: 1.4;">
          ${item.title}
        </p>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #27272a; padding-top: 8px; font-size: 11px;">
          <span style="font-weight: 800; color: #fbbf24;">★ ${item.rating.toFixed(1)}</span>
          <span style="color: #10b981; font-weight: 800;">${item.priceText || 'Verified'}</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      className: 'dark-emerald-popup',
      closeButton: true
    });

    marker.on('click', () => {
      setSelectedItem(item);
    });

    group.addLayer(marker);
  };

  // "Near Me" Geolocation Control with preview iframe permissions policy fallback
  const handleNearMe = () => {
    const fallbackLocation: [number, number] = (
      currentUser?.business_latitude && currentUser?.business_longitude
    )
      ? [Number(currentUser.business_latitude), Number(currentUser.business_longitude)]
      : DEFAULT_CENTER;

    const fallbackLabel = (
      currentUser?.business_latitude && currentUser?.business_longitude
    )
      ? (currentUser.business_name || 'your saved business location')
      : 'Johannesburg, South Africa';

    if (!navigator.geolocation) {
      setLocationError(`Geolocation is not supported by your browser. Centered on ${fallbackLabel}.`);
      setCurrentCenter(fallbackLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(fallbackLocation, 12, { duration: 1.2 });
      }
      setTimeout(() => setLocationError(null), 5000);
      return;
    }

    setLocatingUser(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const newCenter: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentCenter(newCenter);
        setHasMovedCenter(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(newCenter, 13, { duration: 1.2 });
        }
      },
      (err) => {
        setLocatingUser(false);
        setCurrentCenter(fallbackLocation);
        setHasMovedCenter(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(fallbackLocation, 12, { duration: 1.2 });
        }

        if (
          err.code === 1 || 
          err.message.toLowerCase().includes('permissions policy') || 
          err.message.toLowerCase().includes('denied')
        ) {
          setLocationError('Location access is blocked in this preview. Centered on ' + fallbackLabel + '. Open app in a new browser tab to use live GPS.');
        } else {
          setLocationError(`Could not retrieve location (${err.message}). Centered on ${fallbackLabel}.`);
        }
        setTimeout(() => setLocationError(null), 6000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // "Search This Area" Reset Handler
  const handleSearchThisArea = () => {
    setHasMovedCenter(false);
  };

  // Empty state condition:
  // Shows ONLY if there are truly zero pins in the dataset (hasAnyPins === false)
  // OR when radius filter excludes all pins (visiblePinsInRadius.length === 0)
  const shouldShowEmptyState = !hasAnyPins || (hasAnyPins && visiblePinsInRadius.length === 0);

  return (
    <div className="w-full flex flex-col gap-4 pb-8">
      {/* MAP CONTAINER */}
      <div className="relative w-full h-[calc(100vh-160px)] min-h-[500px] bg-[#0c0c0e] rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-400 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Side: Category Filter Chips & Radius Slider */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-[#18181b]/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-800 shadow-2xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              All Pins ({allMapItems.length})
            </button>

            <button
              onClick={() => setFilterType('services')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'services'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Services</span>
            </button>

            <button
              onClick={() => setFilterType('events')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'events'
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/25'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-neutral-800 mx-1 hidden sm:block" />

          {/* Radius Slider */}
          <div className="flex items-center gap-2 px-2 py-1 bg-neutral-900/80 rounded-xl border border-neutral-800 text-xs">
            <Sliders className="w-3 h-3 text-emerald-400" />
            <span className="text-neutral-400 text-[11px] font-bold">Radius:</span>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-16 sm:w-24 accent-emerald-500 cursor-pointer"
            />
            <span className="text-emerald-400 font-extrabold text-[11px] min-w-[32px]">
              {radiusKm}km
            </span>
          </div>
        </div>

        {/* Right Side: "Show All Pins", "Near Me", & "+ Add Business Pin" */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {hasAnyPins && (
            <button
              onClick={handleFitAllPins}
              title="Show all pins across the country"
              className="px-3.5 py-2 bg-[#18181b]/90 backdrop-blur-md hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Show All Pins ({matchingTypePins.length})</span>
            </button>
          )}

          <button
            onClick={handleNearMe}
            disabled={locatingUser}
            className="px-3.5 py-2 bg-[#18181b]/90 backdrop-blur-md hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Center map on your current GPS location"
          >
            <Navigation className={`w-3.5 h-3.5 text-teal-400 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Locating...' : 'Near Me'}</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {currentUser.show_on_map ? 'Manage Business Pin' : '+ Add Business Pin'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Prompt When Map is Dragged: "Search This Area" + "Show All Pins" */}
      {hasMovedCenter && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-400 animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleSearchThisArea}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-full shadow-2xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Search This Area ({radiusKm}km)</span>
          </button>

          {hasAnyPins && (
            <button
              onClick={handleFitAllPins}
              className="px-4 py-2 bg-[#18181b]/95 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Show All Pins</span>
            </button>
          )}
        </div>
      )}

      {/* Geolocation Notification / Fallback Alert */}
      {locationError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-400 max-w-md w-[92%] bg-[#18181b]/95 text-amber-200 border border-amber-500/40 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="text-neutral-400 hover:text-white p-0.5 shrink-0 transition"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Embedded CSS dark filter for Leaflet standard OpenStreetMap tiles */}
      <style>{`
        .leaflet-tile-pane {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }
      `}</style>

      {/* LEAFLET MAP CANVAS (h-full w-full with OpenStreetMap + Dark CSS filter) */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 bg-[#09090b]"
        style={{ minHeight: '100%' }}
      />

      {/* Bottom Privacy Status Banner */}
      <div className="absolute bottom-4 left-4 z-400 bg-[#18181b]/90 backdrop-blur-md border border-neutral-800 text-neutral-300 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-[11px] pointer-events-auto">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Privacy-First Map:</strong> Personal home addresses are strictly hidden. Only designated public business pins appear.
        </span>
      </div>

      {/* Selected Pin Bottom Slide Drawer (Mobile & Desktop friendly) */}
      {selectedItem && (
        <div className="absolute bottom-4 right-4 z-400 max-w-sm w-full bg-[#18181b]/95 border border-neutral-800 p-4 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedItem.avatar}
                alt={selectedItem.ownerName}
                className="w-11 h-11 rounded-2xl object-cover border border-emerald-500/40"
              />
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                  {selectedItem.category}
                </span>
                <h4 className="text-sm font-black text-white leading-tight">
                  {selectedItem.businessName}
                </h4>
                <span className="text-xs text-neutral-400 font-medium">
                  {selectedItem.ownerName}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="text-neutral-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-300 mt-2.5 line-clamp-2 leading-relaxed">
            {selectedItem.title}
          </p>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-800 text-xs">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-white">{selectedItem.rating.toFixed(1)}</span>
              {selectedItem.priceText && (
                <span className="text-emerald-400 font-bold ml-1">({selectedItem.priceText})</span>
              )}
            </div>

            {selectedItem.type === 'service' && onSelectService ? (
              <button
                onClick={() => onSelectService(selectedItem.data)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
              >
                View Service
              </button>
            ) : selectedItem.type === 'event' && onSelectEvent ? (
              <button
                onClick={() => onSelectEvent(selectedItem.data)}
                className="px-3.5 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
              >
                View Event
              </button>
            ) : onOpenProfile ? (
              <button
                onClick={() => onOpenProfile(selectedItem.ownerName)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
              >
                View Full Profile
              </button>
            ) : null}
          </div>
        </div>
      )}

      </div>

      {/* OUTSIDE THE MAP (BELOW): Transparent Empty State Card */}
      {shouldShowEmptyState && (
        <div className="w-full max-w-xl mx-auto bg-transparent border border-neutral-800/80 p-5 rounded-3xl text-center space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-neutral-800 text-emerald-400 flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-sm font-black text-white">
              {hasAnyPins ? 'No businesses in this region' : 'No businesses found'}
            </h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {hasAnyPins
                ? "Try zooming out or clicking 'Show All Pins' to see businesses in other areas."
                : 'Be the first artisan or service provider to add your business to the map!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {hasAnyPins ? (
              <>
                <button
                  onClick={handleFitAllPins}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Show All Pins</span>
                </button>

                <button
                  onClick={() => setRadiusKm(prev => Math.min(prev + 25, 100))}
                  className="px-3.5 py-2 bg-transparent hover:bg-neutral-800/60 border border-neutral-700/80 text-neutral-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Expand to {Math.min(radiusKm + 25, 100)}km
                </button>

                {currentUser && (
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="px-3.5 py-2 bg-transparent hover:bg-neutral-800/60 border border-neutral-700/80 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Add Your Business
                  </button>
                )}
              </>
            ) : (
              currentUser && (
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  + Add Business Pin
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Modal: Business Location Form */}
      {isLocationModalOpen && currentUser && (
        <div className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-xl w-full">
            <BusinessLocationForm
              currentUser={currentUser}
              onUpdateUser={(u) => {
                onUpdateUser?.(u);
                setIsLocationModalOpen(false);
              }}
              onClose={() => setIsLocationModalOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
