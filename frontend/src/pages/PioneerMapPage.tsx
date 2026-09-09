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
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView(
      [39.9334, 32.8597],
      6
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }
    ).addTo(map);

    L.marker([39.9334, 32.8597])
      .addTo(map)
      .bindPopup(
        "<b>🗺️ PioneerMap</b><br />Pi Economy Map"
      );

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
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
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: "0 0 8px" }}>
          🗺️ PioneerMap
        </h1>

        <p style={{ margin: "0 0 18px" }}>
          Discover Pi-powered stores, products, services,
          and businesses near you.
        </p>

        {!signedIn ? (
          <button
            onClick={loginWithPi}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "none",
            }}
          >
            🔐 Sign in with Pi
          </button>
        ) : (
          <div
            style={{
              display: "inline-block",
              padding: "12px 24px",
              fontSize: "16px",
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
          <p
            style={{
              marginTop: "12px",
              marginBottom: "0",
              fontWeight: "bold",
            }}
          >
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

      <div
        style={{
          padding: "15px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            ref={mapRef}
            style={{
              width: "100%",
              height: "500px",
            }}
          />
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "12px",
            fontWeight: "bold",
          }}
        >
          {activeCategory === "All"
            ? "🌍 Explore the Pi Economy"
            : `${
                categories.find(
                  (category) =>
                    category.name === activeCategory
                )?.icon
              } ${activeCategory}`}
        </p>
      </div>
    </div>
  );
}

export default PioneerMapPage;
