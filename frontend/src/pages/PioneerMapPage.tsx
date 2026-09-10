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
    icon: "🍔",
    color: "#FF9800",
  },
  Services: {
    icon: "🔧",
    color: "#009688",
  },
  Jobs: {
    icon: "💼",
    color: "#673AB7",
  },
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

function distanceInKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function createCategoryIcon(
  category: Exclude<Category, "All">
) {
  const item = categoryIcons[category];

  return L.divIcon({
    className: "pioneer-place-marker",
    html: `
      <div style="
        width:48px;
        height:48px;
        background:${item.color};
        border:4px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 12px rgba(0,0,0,.35);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          font-size:23px;
        ">
          ${item.icon}
        </span>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
    popupAnchor: [0, -55],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "pioneer-user-marker",
    html: `
      <div style="
        width:22px;
        height:22px;
        background:#1976D2;
        border:4px solid white;
        border-radius:50%;
        box-shadow:
          0 0 0 8px rgba(25,118,210,.20),
          0 3px 10px rgba(0,0,0,.35);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function PioneerMapPage() {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pioneermap-2.onrender.com";

  const [status, setStatus] =
    useState("");

  const [signedIn, setSignedIn] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [places, setPlaces] =
    useState<Place[]>(initialPlaces);

  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const [searchText, setSearchText] =
    useState("");

  const [nearbyOnly, setNearbyOnly] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState<{
      lat: number;
      lng: number;
    } | null>(null);

  const [selectedPlace, setSelectedPlace] =
    useState<Place | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState<{
      lat: number;
      lng: number;
    } | null>(null);

  const [placeName, setPlaceName] =
    useState("");

  const [placeDescription, setPlaceDescription] =
    useState("");

  const [placeCategory, setPlaceCategory] =
    useState<Exclude<Category, "All">>("Stays");

  const mapRef =
    useRef<HTMLDivElement | null>(null);

  const mapInstance =
    useRef<L.Map | null>(null);

  const markersRef =
    useRef<L.Marker[]>([]);

  const userMarkerRef =
    useRef<L.Marker | null>(null);

  /*
   * PI LOGIN
   *
   * ÖNEMLİ:
   * Pi authenticate sonucunu backend'e gönderiyoruz.
   * Backend /user/signin üzerinden accessToken'ı doğruluyor
   * ve req.session.currentUser oluşturuyor.
   */
  const loginWithPi = async () => {
    try {
      const pi = (window as any).Pi;

      if (!pi) {
        setStatus("❌ Pi SDK yüklenemedi.");
        return;
      }

      setStatus("⏳ Pi bağlantısı kuruluyor...");

      await pi.init({
        version: "2.0",
        sandbox: false,
      });

      const auth = await pi.authenticate(
        ["username"],
        () => true
      );

      if (!auth?.user?.username) {
        throw new Error(
          "Pi kullanıcı bilgisi alınamadı."
        );
      }

      if (!auth?.accessToken) {
        throw new Error(
          "Pi accessToken alınamadı."
        );
      }

      /*
       * Pi kullanıcısını backend session'a bağla.
       */
      const response = await fetch(
        `${backendUrl}/user/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            authResult: auth,
          }),
        }
      );

      const data =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Backend Pi giriş işlemi başarısız oldu."
        );
      }

      setSignedIn(true);
      setUsername(auth.user.username);

      setStatus(
        `✅ Pi Connected — @${auth.user.username}`
      );
    } catch (error) {
      console.error(
        "Pi login error:",
        error
      );

      setSignedIn(false);

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Pi Sign-In başarısız oldu."
      );
    }
  };

  /*
   * LOAD PLACES
   */
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
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        if (Array.isArray(data)) {
          setPlaces(
            data.length > 0
              ? data
              : initialPlaces
          );
        }
      } catch (error) {
        console.error(
          "Places load error:",
          error
        );
      }
    };

    loadPlaces();
  }, [backendUrl]);

  /*
   * CREATE MAP
   */
  useEffect(() => {
    if (
      !mapRef.current ||
      mapInstance.current
    ) {
      return;
    }

    const map =
      L.map(mapRef.current).setView(
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
        "📍 Konum seçildi. Yer bilgilerini gir."
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

  /*
   * NEARBY PLACES
   */
  const findNearbyPlaces = () => {
    if (!navigator.geolocation) {
      setStatus(
        "❌ Bu cihaz konum özelliğini desteklemiyor."
      );
      return;
    }

    setStatus("📍 Konumun alınıyor...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setNearbyOnly(true);

        const map =
          mapInstance.current;

        if (map) {
          map.setView(
            [
              location.lat,
              location.lng,
            ],
            12
          );
        }

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
        }

        if (map) {
          userMarkerRef.current =
            L.marker(
              [
                location.lat,
                location.lng,
              ],
              {
                icon: createUserIcon(),
                zIndexOffset: 1000,
              }
            )
              .addTo(map)
              .bindPopup("📍 Konumunuz");
        }

        setStatus(
          "📍 Yakınındaki yerler gösteriliyor."
        );
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setStatus(
          "❌ Konum izni verilmedi. Konum iznini açıp tekrar dene."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  /*
   * SHOW ALL
   */
  const showAllPlaces = () => {
    setNearbyOnly(false);
    setUserLocation(null);
    setSelectedPlace(null);

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    setStatus(
      "🌍 Tüm yerler gösteriliyor."
    );
  };

  /*
   * DELETE PLACE
   */
  const deletePlace = async (
    place: Place
  ) => {
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

    const confirmed =
      window.confirm(
        `"${place.name}" yerini silmek istediğine emin misin?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setStatus(
        "⏳ Yer siliniyor..."
      );

      const response = await fetch(
        `${backendUrl}/api/places/${place._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Yer silinemedi."
        );
      }

      setPlaces((current) =>
        current.filter(
          (item) =>
            item._id !== place._id
        )
      );

      setSelectedPlace(null);

      setStatus(
        `✅ ${place.name} silindi.`
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Yer silinemedi."
      );
    }
  };

  /*
   * FILTER + MARKERS
   */
  useEffect(() => {
    const map = mapInstance.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach(
      (marker) => marker.remove()
    );

    markersRef.current = [];

    const query =
      searchText
        .trim()
        .toLowerCase();

    let filteredPlaces =
      places.filter((place) => {
        const categoryMatch =
          activeCategory === "All" ||
          place.category ===
            activeCategory;

        const text =
          [
            place.name,
            place.description,
            place.username || "",
            place.category,
          ]
            .join(" ")
            .toLowerCase();

        const searchMatch =
          query === "" ||
          text.includes(query);

        let nearbyMatch = true;

        if (
          nearbyOnly &&
          userLocation
        ) {
          const distance =
            distanceInKm(
              userLocation.lat,
              userLocation.lng,
              place.lat,
              place.lng
            );

          nearbyMatch =
            distance <= 50;
        }

        return (
          categoryMatch &&
          searchMatch &&
          nearbyMatch
        );
      });

    if (userLocation) {
      filteredPlaces =
        [...filteredPlaces].sort(
          (a, b) => {
            const distanceA =
              distanceInKm(
                userLocation.lat,
                userLocation.lng,
                a.lat,
                a.lng
              );

            const distanceB =
              distanceInKm(
                userLocation.lat,
                userLocation.lng,
                b.lat,
                b.lng
              );

            return (
              distanceA - distanceB
            );
          }
        );
    }

    filteredPlaces.forEach(
      (place) => {
        const category =
          categoryIcons[
            place.category
          ];

        const distance =
          userLocation
            ? distanceInKm(
                userLocation.lat,
                userLocation.lng,
                place.lat,
                place.lng
              )
            : null;

        const marker =
          L.marker(
            [
              place.lat,
              place.lng,
            ],
            {
              icon:
                createCategoryIcon(
                  place.category
                ),
            }
          ).addTo(map);

        const safeId =
          `details-${(
            place._id ||
            `${place.name}-${place.lat}-${place.lng}`
          )
            .replace(
              /[^a-zA-Z0-9_-]/g,
              "-"
            )}`;

        marker.bindPopup(`
          <div
            style="
              min-width:220px;
              text-align:center;
              font-family:Arial,sans-serif;
            "
          >
            <div
              style="
                font-size:34px;
                margin-bottom:6px;
              "
            >
              ${category.icon}
            </div>

            <div
              style="
                font-size:19px;
                font-weight:700;
                margin-bottom:5px;
              "
            >
              ${place.name}
            </div>

            <div
              style="
                color:#666;
                font-size:14px;
                line-height:1.4;
              "
            >
              ${place.description}
            </div>

            ${
              place.username
                ? `
                  <div
                    style="
                      margin-top:8px;
                      color:#7b1fa2;
                      font-weight:700;
                    "
                  >
                    👤 @${place.username}
                  </div>
                `
                : ""
            }

            <div
              style="
                display:inline-block;
                margin-top:8px;
                padding:5px 12px;
                border-radius:20px;
                background:${category.color};
                color:white;
                font-weight:700;
                font-size:12px;
              "
            >
              ${place.category}
            </div>

            ${
              distance !== null
                ? `
                  <div
                    style="
                      margin-top:8px;
                      color:#1976D2;
                      font-weight:700;
                    "
                  >
                    📍 ${distance.toFixed(1)} km
                  </div>
                `
                : ""
            }

            <button
              id="${safeId}"
              style="
                width:100%;
                margin-top:12px;
                padding:10px;
                border:0;
                border-radius:9px;
                background:#1976D2;
                color:white;
                font-size:14px;
                font-weight:700;
                cursor:pointer;
              "
            >
              📋 Detayları Gör
            </button>
          </div>
        `);

        marker.on(
          "click",
          () => {
            setSelectedPlace(place);
          }
        );

        marker.on(
          "popupopen",
          () => {
            setTimeout(() => {
              const button =
                document.getElementById(
                  safeId
                );

              if (button) {
                button.onclick = () => {
                  setSelectedPlace(
                    place
                  );

                  map.closePopup();

                  setTimeout(() => {
                    const card =
                      document.getElementById(
                        "pioneer-detail-card"
                      );

                    if (card) {
                      card.scrollIntoView({
                        behavior:
                          "smooth",
                        block:
                          "start",
                      });
                    }
                  }, 100);
                };
              }
            }, 50);
          }
        );

        markersRef.current.push(
          marker
        );
      }
    );
  }, [
    places,
    activeCategory,
    searchText,
    nearbyOnly,
    userLocation,
  ]);

  /*
   * ADD PLACE
   */
  const addPlace = async () => {
    if (!signedIn) {
      setStatus(
        "🔐 Önce Pi ile giriş yapmalısın."
      );
      return;
    }

    if (!placeName.trim()) {
      setStatus(
        "❌ Yer adını yaz."
      );
      return;
    }

    const map =
      mapInstance.current;

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
      username:
        username || undefined,
    };

    try {
      setStatus(
        "⏳ Yer kaydediliyor..."
      );

      const response =
        await fetch(
          `${backendUrl}/api/places`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify(
              newPlace
            ),
          }
        );

      const data =
        await response.json();

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
          typeof data.lat ===
          "number"
            ? data.lat
            : newPlace.lat,
        lng:
          typeof data.lng ===
          "number"
            ? data.lng
            : newPlace.lng,
        description:
          data.description ||
          newPlace.description,
        username:
          data.username ||
          newPlace.username,
        user_id:
          data.user_id ||
          null,
      };

      setPlaces(
        (current) => [
          ...current,
          savedPlace,
        ]
      );

      setSelectedPlace(
        savedPlace
      );

      if (map) {
        map.setView(
          [
            savedPlace.lat,
            savedPlace.lng,
          ],
          Math.max(
            map.getZoom(),
            12
          )
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
        "Add place error:",
        error
      );

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Yer kaydedilemedi."
      );
    }
  };

  const categories: Array<{
    name: Category;
    icon: string;
  }> = [
    {
      name: "All",
      icon: "🌍",
    },
    {
      name: "Stays",
      icon: "🏠",
    },
    {
      name: "Shops",
      icon: "🛍️",
    },
    {
      name: "Food",
      icon: "🍔",
    },
    {
      name: "Services",
      icon: "🔧",
    },
    {
      name: "Jobs",
      icon: "💼",
    },
  ];

  const selectedDistance =
    selectedPlace &&
    userLocation
      ? distanceInKm(
          userLocation.lat,
          userLocation.lng,
          selectedPlace.lat,
          selectedPlace.lng
        )
      : null;

  const selectedCategory =
    selectedPlace
      ? categoryIcons[
          selectedPlace.category
        ]
      : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        color: "#222",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          padding: "22px 16px",
          textAlign: "center",
          borderBottom:
            "1px solid #eee",
        }}
      >
        <h1
          style={{
            margin:
              "0 0 12px",
            fontSize: "34px",
          }}
        >
          🗺️ PioneerMap
        </h1>

        <p
          style={{
            margin:
              "0 auto 18px",
            maxWidth: "650px",
            color: "#666",
          }}
        >
          Discover places,
          businesses and services
          in the Pi Economy.
        </p>

        <button
          onClick={loginWithPi}
          style={{
            padding:
              "11px 18px",
            border: "none",
            borderRadius: "10px",
            background:
              signedIn
                ? "#2e7d32"
                : "#1976D2",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {signedIn
            ? `🟢 Pi Connected — @${username}`
            : "🔐 Sign in with Pi"}
        </button>

        {status && (
          <div
            style={{
              margin:
                "15px auto 0",
              maxWidth: "700px",
              padding: "11px 14px",
              borderRadius: "10px",
              background: "#eef5ff",
              color: "#174a7c",
              fontWeight: 600,
            }}
          >
            {status}
          </div>
        )}
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          <input
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
            placeholder="🔎 Yer, işletme veya kullanıcı ara..."
            style={{
              flex: "1 1 260px",
              minWidth: "220px",
              padding: "13px",
              border:
                "1px solid #ddd",
              borderRadius: "10px",
              fontSize: "15px",
            }}
          />

          <button
            onClick={
              nearbyOnly
                ? showAllPlaces
                : findNearbyPlaces
            }
            style={{
              padding:
                "12px 16px",
              border: "none",
              borderRadius: "10px",
              background:
                nearbyOnly
                  ? "#455a64"
                  : "#1976D2",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {nearbyOnly
              ? "🌍 Tüm Yerleri Göster"
              : "📍 Yakınımdaki Yerler"}
          </button>

          <button
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
            style={{
              padding:
                "12px 16px",
              border: "none",
              borderRadius: "10px",
              background: "#2e7d32",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            📍 Add Place
          </button>
        </div>

        {nearbyOnly && (
          <div
            style={{
              marginBottom: "14px",
              padding: "12px",
              background: "#e8f5e9",
              borderRadius: "10px",
              color: "#256029",
              fontWeight: 700,
            }}
          >
            📍 Yakınındaki yerler
            gösteriliyor.
            <br />
            📏 En yakın yerler önce
            sıralanıyor.
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          {categories.map(
            (category) => (
              <button
                key={
                  category.name
                }
                onClick={() =>
                  setActiveCategory(
                    category.name
                  )
                }
                style={{
                  padding:
                    "10px 13px",
                  border:
                    activeCategory ===
                    category.name
                      ? "2px solid #1976D2"
                      : "1px solid #ddd",
                  borderRadius: "10px",
                  background:
                    activeCategory ===
                    category.name
                      ? "#eaf3ff"
                      : "white",
                  color: "#222",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {category.icon}{" "}
                {category.name}
              </button>
            )
          )}
        </div>

        {showForm && (
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "14px",
              boxShadow:
                "0 4px 18px rgba(0,0,0,.08)",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              📍 Yeni Yer Ekle
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "14px",
              }}
            >
              Haritada bir noktaya
              tıklayarak konum
              seçebilirsin.
            </p>

            <input
              value={placeName}
              onChange={(e) =>
                setPlaceName(
                  e.target.value
                )
              }
              placeholder="Yer / işletme adı"
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding: "12px",
                marginBottom: "10px",
                border:
                  "1px solid #ddd",
                borderRadius: "9px",
              }}
            />

            <select
              value={placeCategory}
              onChange={(e) =>
                setPlaceCategory(
                  e.target
                    .value as Exclude<
                    Category,
                    "All"
                  >
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                border:
                  "1px solid #ddd",
                borderRadius: "9px",
                background: "white",
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
              onChange={(e) =>
                setPlaceDescription(
                  e.target.value
                )
              }
              placeholder="Açıklama"
              rows={4}
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding: "12px",
                marginBottom: "10px",
                border:
                  "1px solid #ddd",
                borderRadius: "9px",
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={addPlace}
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    "#2e7d32",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                💾 Kaydet
              </button>

              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedLocation(
                    null
                  );
                }}
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius: "9px",
                  background:
                    "#757575",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                İptal
              </button>
            </div>

            {selectedLocation && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "9px",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                📍 Seçilen konum:{" "}
                {selectedLocation.lat.toFixed(
                  5
                )}
                ,{" "}
                {selectedLocation.lng.toFixed(
                  5
                )}
              </div>
            )}
          </div>
        )}

        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "520px",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 4px 18px rgba(0,0,0,.12)",
            background: "#ddd",
          }}
        />

        {selectedPlace && (
          <div
            id="pioneer-detail-card"
            style={{
              marginTop: "16px",
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow:
                "0 5px 20px rgba(0,0,0,.10)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "42px",
                  }}
                >
                  {selectedCategory?.icon}
                </div>

                <h2
                  style={{
                    margin:
                      "5px 0",
                  }}
                >
                  {selectedPlace.name}
                </h2>

                <div
                  style={{
                    display:
                      "inline-block",
                    padding:
                      "5px 10px",
                    borderRadius:
                      "20px",
                    background:
                      selectedCategory?.color ||
                      "#1976D2",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  {selectedPlace.category}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedPlace(
                    null
                  )
                }
                style={{
                  border: "none",
                  background:
                    "#eeeeee",
                  borderRadius: "8px",
                  padding:
                    "8px 11px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                marginTop: "18px",
                lineHeight: 1.6,
                color: "#444",
              }}
            >
              {selectedPlace.description}
            </p>

            <div
              style={{
                display: "grid",
                gap: "8px",
                marginTop: "14px",
              }}
            >
              <div>
                👤{" "}
                <strong>
                  @
                  {selectedPlace.username ||
                    "anonymous"}
                </strong>
              </div>

              {selectedDistance !==
                null && (
                <div
                  style={{
                    color:
                      "#1976D2",
                    fontWeight: 700,
                  }}
                >
                  📍{" "}
                  {selectedDistance.toFixed(
                    1
                  )}{" "}
                  km uzakta
                </div>
              )}

              <div
                style={{
                  color: "#666",
                  fontSize: "13px",
                }}
              >
                🌐{" "}
                {selectedPlace.lat.toFixed(
                  5
                )}
                ,{" "}
                {selectedPlace.lng.toFixed(
                  5
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const map =
                  mapInstance.current;

                if (map) {
                  map.setView(
                    [
                      selectedPlace.lat,
                      selectedPlace.lng,
                    ],
                    15
                  );
                }
              }}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                border: "none",
                borderRadius: "10px",
                background:
                  "#1976D2",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🗺️ Haritada Göster
            </button>

            {signedIn &&
              selectedPlace.username ===
                username && (
                <button
                  onClick={() =>
                    deletePlace(
                      selectedPlace
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "9px",
                    padding: "12px",
                    border: "none",
                    borderRadius:
                      "10px",
                    background:
                      "#d32f2f",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Yeri Sil
                </button>
              )}
          </div>
        )}
      </main>
    </div>
  );
}

export default PioneerMapPage;
