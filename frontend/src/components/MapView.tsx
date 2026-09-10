import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPlace = {
  _id?: string;
  name: string;
  category?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
};

type MapViewProps = {
  places?: MapPlace[];
  center?: [number, number];
  zoom?: number;
  selectedLocation?: [number, number] | null;
  onMapClick?: (location: [number, number]) => void;
  onPlaceClick?: (place: MapPlace) => void;
  height?: string;
};

const categoryIcons: Record<string, string> = {
  Stays: "🏠",
  Shops: "🛍️",
  Food: "🍔",
  Services: "🔧",
  Jobs: "💼",
  All: "📍",
};

function createIcon(category?: string) {
  const emoji = categoryIcons[category || "All"] || "📍";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:38px;
        height:38px;
        border-radius:50%;
        background:#ffffff;
        border:3px solid #6d28d9;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
        box-shadow:0 3px 10px rgba(0,0,0,.3);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

function createSelectedIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:50%;
        background:#ffffff;
        border:4px solid #16a34a;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        box-shadow:0 3px 12px rgba(0,0,0,.35);
      ">
        📍
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export default function MapView({
  places = [],
  center = [39.9334, 32.8597],
  zoom = 6,
  selectedLocation = null,
  onMapClick,
  onPlaceClick,
  height = "500px",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const markers = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = markers;

    if (onMapClick) {
      map.on("click", (event: L.LeafletMouseEvent) => {
        onMapClick([event.latlng.lat, event.latlng.lng]);
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
      selectedMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    if (!map || !markers) return;

    markers.clearLayers();

    places.forEach((place) => {
      const latitude =
        typeof place.latitude === "number"
          ? place.latitude
          : place.lat;

      const longitude =
        typeof place.longitude === "number"
          ? place.longitude
          : place.lng;

      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
      ) {
        return;
      }

      const marker = L.marker(
        [latitude, longitude],
        {
          icon: createIcon(place.category),
        }
      );

      const description = place.description
        ? `<div style="margin-top:6px;">${place.description}</div>`
        : "";

      const category = place.category
        ? `<div style="margin-top:6px;font-size:12px;color:#666;">
             ${categoryIcons[place.category] || "📍"} ${place.category}
           </div>`
        : "";

      marker.bindPopup(`
        <div style="
          min-width:180px;
          max-width:260px;
          font-family:Arial,sans-serif;
        ">
          <div style="
            font-size:16px;
            font-weight:700;
            margin-bottom:4px;
          ">
            ${place.name}
          </div>

          ${category}

          ${description}

          ${
            onPlaceClick
              ? `
                <button
                  data-place-id="${place._id || ""}"
                  style="
                    margin-top:10px;
                    width:100%;
                    padding:8px 10px;
                    border:0;
                    border-radius:8px;
                    background:#6d28d9;
                    color:#fff;
                    font-weight:700;
                    cursor:pointer;
                  "
                >
                  Detayları Gör
                </button>
              `
              : ""
          }
        </div>
      `);

      if (onPlaceClick) {
        marker.on("popupopen", () => {
          const popup = marker.getPopup();

          if (!popup) return;

          const element = popup.getElement();

          if (!element) return;

          const button = element.querySelector(
            "[data-place-id]"
          ) as HTMLButtonElement | null;

          if (!button) return;

          button.onclick = () => {
            onPlaceClick(place);
          };
        });
      }

      marker.addTo(markers);
    });
  }, [places, onPlaceClick]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (!selectedLocation) return;

    const marker = L.marker(selectedLocation, {
      icon: createSelectedIcon(),
    }).addTo(map);

    marker.bindPopup("📍 Seçilen konum").openPopup();

    selectedMarkerRef.current = marker;

    map.setView(selectedLocation, Math.max(map.getZoom(), 14));
  }, [selectedLocation]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height,
        minHeight: "300px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid #ddd",
        background: "#eee",
      }}
    />
  );
               }
