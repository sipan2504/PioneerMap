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
  _id?: string;
  name: string;
  category: Exclude<Category, "All">;
  lat: number;
  lng: number;
  description: string;
  username?: string;
  user_id?: string | null;
};

const initialPlaces: Place[] = [
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
  Stays: { icon: "🏠", color: "#1976D2" },
  Shops: { icon: "🛍️", color: "#E91E63" },
  Food: { icon: "🍴", color: "#FF9800" },
  Services: { icon: "🔧", color: "#00A6A6" },
  Jobs: { icon: "💼", color: "#673AB7" },
};

function createCategoryIcon(
  category: Exclude<Category, "All">
) {
  const { icon, color } = categoryIcons[category];

  return L.divIcon({
    className: "pioneer-map-marker",
    html: `
      <div style="
        width:48px;
        height:48px;
        background:${color};
        border:4px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 10px rgba(0,0,0,0.30);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          font-size:23px;
          line-height:1;
        ">${icon}</span>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
    popupAnchor: [0, -55],
  });
}

function PioneerMapPage() {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pioneermap-2.onrender.com";

  const [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [username, setUsername] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const [searchText, setSearchText] =
    useState("");

  const [places, setPlaces] =
    useState<Place[]>(initialPlaces);

  const [showForm, setShowForm] = useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState<{
      lat: number;
      lng: number;
    } | null>(null);

  const [placeName, setPlaceName] = useState("");
  const [placeDescription, setPlaceDescription] =
    useState("");

  const [placeCategory, setPlaceCategory] =
    useState<Exclude<Category, "All">>("Stays");

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
      setUsername(auth.user.username);

      setStatus(
        `Hoş geldin @${auth.user.username}`
      );
    } catch (error) {
      console.error(error);
      setStatus("Pi Sign-In başarısız oldu.");
    }
  };

  // MongoDB'deki yerleri getir
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/places`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Places request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setPlaces(data);
        }
      } catch (error) {
        console.error(
          "Places yüklenemedi:",
          error
        );
      }
    };

    loadPlaces();
  }, [backendUrl]);

  // Haritayı oluştur
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) {
      return;
    }

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

    map.on("click", (event) => {
      setSelectedLocation({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });

      setShowForm(true);

      setStatus(
        "Konum seçildi. Yer bilgilerini gir."
      );
    });

    mapInstance.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Yer silme
  const deletePlace = async (place: Place) => {
    if (!place._id) {
      setStatus(
        "❌ Bu yer silinemiyor: ID bulunamadı."
      );
      return;
    }

    if (!signedIn) {
      setStatus(
        "🔐 Silmek için önce Pi ile giriş yapmalısın."
      );
      return;
    }

    const confirmed = window.confirm(
      `"${place.name}" yerini silmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setStatus("⏳ Yer siliniyor...");

      const response = await fetch(
        `${backendUrl}/api/places/${place._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Oturum bulunamadı. Pi ile tekrar giriş yap."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Bu yeri sadece sahibi silebilir."
          );
        }

        throw new Error(
          data?.message || "Yer silinemedi."
        );
      }

      setPlaces((current) =>
        current.filter(
          (item) => item._id !== place._id
        )
      );

      setStatus(
        `✅ ${place.name} silindi.`
      );
    } catch (error) {
      console.error(
        "Yer silme hatası:",
        error
      );

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Yer silinemedi."
      );
    }
  };

  // Markerları göster
  useEffect(() => {
    const map = mapInstance.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    const normalizedSearch =
      searchText.trim().toLowerCase();

    const filteredPlaces =
      places.filter((place) => {
        const matchesCategory =
          activeCategory === "All" ||
          place.category === activeCategory;

        const searchableText = [
          place.name,
          place.description,
          place.username || "",
          place.category,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedSearch === "" ||
          searchableText.includes(
            normalizedSearch
          );

        return (
          matchesCategory &&
          matchesSearch
        );
      });

    filteredPlaces.forEach((place) => {
      const isMyPlace =
        signedIn &&
        !!username &&
        place.username === username;

      const marker = L.marker(
        [place.lat, place.lng],
        {
          icon: createCategoryIcon(
            place.category
          ),
        }
      ).addTo(map);

      const deleteButton = isMyPlace
        ? `
          <button
            id="delete-place-${place._id}"
            style="
              margin-top:10px;
              padding:7px 12px;
              border:none;
              border-radius:7px;
              background:#d32f2f;
              color:white;
              font-weight:bold;
              cursor:pointer;
              width:100%;
            "
          >
            🗑️ Sil
          </button>
        `
        : "";

      marker.bindPopup(`
        <div style="
          min-width:180px;
          text-align:center;
        ">
          <div style="
            font-size:28px;
            margin-bottom:5px;
          ">
            ${
              categoryIcons[
                place.category
              ].icon
            }
          </div>

          <strong style="
            font-size:16px;
          ">
            ${place.name}
          </strong>

          <br />

          <span style="
            color:#666;
          ">
            ${place.description}
          </span>

          ${
            place.username
              ? `
                <br />
                <span style="
                  display:inline-block;
                  margin-top:6px;
                  color:#7b1fa2;
                  font-weight:bold;
                ">
                  👤 @${place.username}
                </span>
              `
              : ""
          }

          <br />

          <span style="
            display:inline-block;
            margin-top:8px;
            padding:4px 10px;
            border-radius:12px;
            background:${
              categoryIcons[
                place.category
              ].color
            };
            color:white;
            font-size:12px;
          ">
            ${place.category}
          </span>

          ${deleteButton}
        </div>
      `);

      marker.on("popupopen", () => {
        if (!isMyPlace || !place._id) {
          return;
        }

        const button = document.getElementById(
          `delete-place-${place._id}`
        );

        if (button) {
          button.onclick = () => {
            deletePlace(place);
          };
        }
      });

      markersRef.current.push(marker);
    });
  }, [
    places,
    activeCategory,
    searchText,
    signedIn,
    username,
  ]);

  // Yeni yeri MongoDB'ye kaydet
  const addPlace = async () => {
    if (!signedIn) {
      setStatus(
        "🔐 Önce Pi ile giriş yapmalısın."
      );
      return;
    }

    if (!placeName.trim()) {
      setStatus("Yer adını yaz.");
      return;
    }

    const map = mapInstance.current;

    const location =
      selectedLocation ||
      (map
        ? map.getCenter()
        : {
            lat: 39.9334,
            lng: 32.8597,
          });

    const newPlace: Place = {
      name: placeName.trim(),
      category: placeCategory,
      lat: location.lat,
      lng: location.lng,
      description:
        placeDescription.trim() ||
        "Pi Economy place",
      username: username || undefined,
    };

    try {
      setStatus("⏳ Yer kaydediliyor...");

      const response = await fetch(
        `${backendUrl}/api/places`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newPlace),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Yer kaydedilemedi."
        );
      }

      const savedPlace: Place = {
        _id: data._id,
        name:
          data.name ||
          newPlace.name,
        category:
          data.category ||
          newPlace.category,
        lat:
          typeof data.lat === "number"
            ? data.lat
            : newPlace.lat,
        lng:
          typeof data.lng === "number"
            ? data.lng
            : newPlace.lng,
        description:
          data.description ||
          newPlace.description,
        username:
          data.username ||
          newPlace.username,
        user_id:
          data.user_id || null,
      };

      setPlaces((current) => [
        ...current,
        savedPlace,
      ]);

      if (map) {
        map.setView(
          [
            savedPlace.lat,
            savedPlace.lng,
          ],
          Math.max(map.getZoom(), 10)
        );
      }

      setPlaceName("");
      setPlaceDescription("");
      setPlaceCategory("Stays");
      setSelectedLocation(null);
      setShowForm(false);

      setStatus(
        `✅ ${savedPlace.name} MongoDB'ye kaydedildi.`
      );
    } catch (error) {
      console.error(
        "Yer kaydetme hatası:",
        error
      );

      setStatus(
        "❌ Yer kaydedilemedi. Backend bağlantısını kontrol et."
      );
    }
  };

  const categories = [
    {
      name: "All" as Category,
      icon: "🌍",
    },
    {
      name: "Stays" as Category,
      icon: "🏠",
    },
    {
      name: "Shops" as Category,
      icon: "🛍️",
    },
    {
      name: "Food" as Category,
      icon: "🍔",
    },
    {
      name: "Services" as Category,
      icon: "🔧",
    },
    {
      name: "Jobs" as Category,
      icon: "💼",
    },
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
          Discover Pi-powered stores,
          products, services, and
          businesses near you.
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
            {username &&
              ` — @${username}`}
          </div>
        )}

        {status && (
          <p
            style={{
              fontWeight: "bold",
            }}
          >
            {status}
          </p>
        )}
      </header>

      {/* Arama */}
      <div
        style={{
          padding: "15px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <input
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="🔎 Yer, işletme veya kullanıcı ara..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 45px 15px 18px",
              borderRadius: "30px",
              border: "2px solid #ddd",
              fontSize: "16px",
              outline: "none",
            }}
          />

          {searchText && (
            <button
              onClick={() => setSearchText("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: "#eee",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "0 15px 15px",
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
              setActiveCategory(
                category.name
              )
            }
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              cursor: "pointer",
              background:
                activeCategory ===
                category.name
                  ? "#f1c40f"
                  : "#ffffff",
              fontWeight:
                activeCategory ===
                category.name
                  ? "bold"
                  : "normal",
            }}
          >
            {category.icon}{" "}
            {category.name}
          </button>
        ))}

        <button
          onClick={() =>
            setShowForm(true)
          }
          style={{
            padding: "10px 18px",
            borderRadius: "20px",
            border: "none",
            background: "#222",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📍 Add Place
        </button>
      </div>

      {showForm && (
        <div
          style={{
            margin: "15px",
            padding: "20px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.12)",
          }}
        >
          <h2>📍 Add Place</h2>

          <p>
            Haritaya dokunursan o konum
            kullanılır. Dokunmazsan harita
            merkezi kullanılır.
          </p>

          {selectedLocation && (
            <p
              style={{
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              ✅ Konum seçildi
            </p>
          )}

          <input
            value={placeName}
            onChange={(event) =>
              setPlaceName(
                event.target.value
              )
            }
            placeholder="Yer adı"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <select
            value={placeCategory}
            onChange={(event) =>
              setPlaceCategory(
                event.target.value as Exclude<
                  Category,
                  "All"
                >
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="Stays">
              🏠 Stays
            </option>

            <option value="Shops">
              🛍️ Shops
            </option>

            <option value="Food">
              🍔 Food
            </option>

            <option value="Services">
              🔧 Services
            </option>

            <option value="Jobs">
              💼 Jobs
            </option>
          </select>

          <textarea
            value={placeDescription}
            onChange={(event) =>
              setPlaceDescription(
                event.target.value
              )
            }
            placeholder="Açıklama"
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={addPlace}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#f1c40f",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "8px",
            }}
          >
            ➕ Yer Ekle
          </button>

          <button
            onClick={() => {
              setShowForm(false);
              setSelectedLocation(null);
            }}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            İptal
          </button>
        </div>
      )}

      <main
        style={{
          padding: "15px",
        }}
      >
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "500px",
            background: "#ddd",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        />

        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {searchText.trim()
            ? `🔎 "${searchText}" sonuçları`
            : activeCategory === "All"
            ? "🌍 Pi Economy Places"
            : `${
                categories.find(
                  (c) =>
                    c.name ===
                    activeCategory
                )?.icon
              } ${activeCategory}`}
        </p>
      </main>
    </div>
  );
}

export default PioneerMapPage;
