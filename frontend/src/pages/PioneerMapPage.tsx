import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Category =
  | "All"
  | "Stays"
  | "Shops"
  | "Food"
  | "Services"
  | "Jobs";

type Place = {
  name: string;
  category: Exclude<Category, "All">;
  lat: number;
  lng: number;
  description: string;
};

const places: Place[] = [
  {
    name: "Pi Stay Ankara",
    category: "Stays",
    lat: 39.9334,
    lng: 32.8597,
    description: "Pi-powered accommodation",
  },
  {
    name: "Pi Market",
    category: "Shops",
    lat: 39.925,
    lng: 32.85,
    description: "Pi-powered shop",
  },
  {
    name: "Pi Food",
    category: "Food",
    lat: 39.94,
    lng: 32.87,
    description: "Pi-powered food business",
  },
  {
    name: "Pi Services",
    category: "Services",
    lat: 39.92,
    lng: 32.88,
    description: "Pi-powered service",
  },
  {
    name: "Pi Jobs",
    category: "Jobs",
    lat: 39.95,
    lng: 32.84,
    description: "Pi Economy job listing",
  },
];

const categoryIcons: Record<
  Exclude<Category, "All">,
  { icon: string; color: string }
> = {
  Stays: {
    icon: "🏠",
    color: "#1976D2",
  },
  Shops: {
    icon: "🛍️",
    color: "#E91E63",
  },
  Food: {
    icon: "🍴",
    color: "#FF9800",
  },
  Services: {
    icon: "🔧",
    color: "#00A6A6",
  },
  Jobs: {
    icon: "💼",
    color: "#673AB7",
  },
};

function createCategoryIcon(
  category: Exclude<Category, "All">
) {
  const { icon, color } = categoryIcons[category];

  return L.divIcon({
    className: "pioneer-map-marker",
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: ${color};
        border: 4px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.30);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 23px;
          line-height: 1;
        ">${icon}</span>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
    popupAnchor: [0, -55],
  });
}

function PioneerMapPage() {
  const [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const loginWithPi = async () => {
    try {
      if (!window.Pi) {
        setStatus("Pi SDK yüklenemedi.");
        return;
      }

      await window.Pi.init({
        version: "2.0",
        sandbox: false,
      });

      const auth = await window.Pi.authenticate(
        ["username"],
        () => true
      );

      setSignedIn(true);
      setStatus(`Hoş geldin @${auth.user.username}`);
    } catch (error) {
      console.error(error);
      setStatus("Pi Sign-In başarısız oldu.");
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView(
      [39.9334, 32.8597],
      6
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "© OpenStreetMap contributors",
      }
    ).addTo(map);

    mapInstance.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;

    if (!map) return;

    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    const filteredPlaces =
      activeCategory === "All"
        ? places
        : places.filter(
            (place) =>
              place.category === activeCategory
          );

    filteredPlaces.forEach((place) => {
      const marker = L.marker(
        [place.lat, place.lng],
        {
          icon: createCategoryIcon(place.category),
        }
      )
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px;text-align:center;">
            <div style="font-size:28px;margin-bottom:5px;">
              ${categoryIcons[place.category].icon}
            </div>
            <strong style="font-size:16px;">
              ${place.name}
            </strong>
            <br />
            <span style="color:#666;">
              ${place.description}
            </span>
            <br />
            <span style="
              display:inline-block;
              margin-top:8px;
              padding:4px 10px;
              border-radius:12px;
              background:${categoryIcons[place.category].color};
              color:white;
              font-size:12px;
            ">
              ${place.category}
            </span>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [activeCategory]);

  const categories = [
    { name: "All" as Category, icon: "🌍" },
    { name: "Stays" as Category, icon: "🏠" },
    { name: "Shops" as Category, icon: "🛍️" },
    { name: "Food" as Category, icon: "🍔" },
    { name: "Services" as Category, icon: "🔧" },
    { name: "Jobs" as Category, icon: "💼" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
      }}
    >
      <header
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#ffffff",
        }}
      >
        <h1>🗺️ PioneerMap</h1>

        <p>
          Discover Pi-powered stores, products,
          services, and businesses near you.
        </p>

        {!signedIn ? (
          <button
            onClick={loginWithPi}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔐 Sign in with Pi
          </button>
        ) : (
          <div
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: "8px",
              background: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: "bold",
            }}
          >
            ✅ Pi Connected
          </div>
        )}

        {status && (
          <p style={{ fontWeight: "bold" }}>
            {status}
          </p>
        )}
      </header>

      <div
        style={{
          padding: "15px",
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          flexWrap: "wrap",
          background: "#ffffff",
        }}
      >
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() =>
              setActiveCategory(category.name)
            }
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              cursor: "pointer",
              background:
                activeCategory === category.name
                  ? "#f1c40f"
                  : "#ffffff",
              fontWeight:
                activeCategory === category.name
                  ? "bold"
                  : "normal",
            }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      <main style={{ padding: "15px" }}>
        <div
          style={{
            width: "100%",
            height: "500px",
            background: "#ddd",
            borderRadius: "12px",
            overflow: "hidden",
          }}
          ref={mapRef}
        />

        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {activeCategory === "All"
            ? "🌍 Pi Economy Places"
            : `${
                categories.find(
                  (c) =>
                    c.name === activeCategory
                )?.icon
              } ${activeCategory}`}
        </p>
      </main>
    </div>
  );
}

export default PioneerMapPage;
