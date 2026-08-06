import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LocationPickerMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  draggable?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
}

// Custom modern SVG marker icon for Leaflet to avoid missing asset paths in Vite bundler
const createCustomIcon = (isDraggable: boolean) => {
  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; items-center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0D5C4D" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="#FFFFFF"/>
      </svg>
      ${isDraggable ? '<div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #0D5C4D; color: white; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">Drag me</div>' : ''}
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  center,
  zoom = 15,
  draggable = false,
  onLocationSelect,
  className = 'h-64 w-full rounded-xl overflow-hidden border border-borderCustom',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize or update map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if lat/lng are valid numbers
    const validLat = typeof center.lat === 'number' && !isNaN(center.lat) ? center.lat : 20.5937;
    const validLng = typeof center.lng === 'number' && !isNaN(center.lng) ? center.lng : 78.9629;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [validLat, validLng],
        zoom,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create marker
      const marker = L.marker([validLat, validLng], {
        draggable,
        icon: createCustomIcon(draggable),
      }).addTo(map);

      // Handle marker drag end
      if (draggable && onLocationSelect) {
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });
      }

      // Handle map click to reposition marker
      if (onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          onLocationSelect(lat, lng);
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // Update existing map and marker
      mapInstanceRef.current.setView([validLat, validLng], zoom);
      if (markerRef.current) {
        markerRef.current.setLatLng([validLat, validLng]);
      }
    }

    // Trigger map resize check to handle container renders inside modals or tabs
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
  }, [center.lat, center.lng, zoom, draggable, onLocationSelect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} className={className} style={{ zIndex: 1 }} />;
};
