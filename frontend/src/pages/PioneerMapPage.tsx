import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function PioneerMapPage() {
  const [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

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
    if (!mapRef.current) return;

    try {
      const map = L.map(mapRef.current).setView(
        [39.9334, 32.8597],
        6
      );

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        }
      ).addTo(map);

      L.marker([39.9334, 32.8597])
        .addTo(map)
        .bindPopup(
          "<b>PioneerMap</b><br/>Pi Economy Map"
        );

      mapInstance.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    } catch (error) {
      console.error("Map error:", error);
      setStatus("Harita yüklenemedi.");
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const categories = [
    { name: "All", icon: "🌍" },
    { name: "Stays", icon: "🏠" },
    { name: "Shops", icon: "🛍️" },
    { name: "Food", icon: "🍔" },
    { name: "Services", icon: "🔧" },
    { name: "Jobs", icon: "💼" },
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
          Discover Pi-powered stores, products, services,
          and businesses near you.
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
            ? "🌍 Explore the Pi Economy"
            : `${categories.find(
                (c) => c.name === activeCategory
              )?.icon} ${activeCategory}`}
        </p>
      </main>
    </div>
  );
}

export default PioneerMapPage;
