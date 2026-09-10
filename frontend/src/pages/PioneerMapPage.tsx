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
  language?: string;
  country?: string;
};

const categoryIcons: Record<
  Exclude<Category, "All">,
  { icon: string; color: string }
> = {
  Stays: { icon: "🏠", color: "#1976D2" },
  Shops: { icon: "🛍️", color: "#E91E63" },
  Food: { icon: "🍔", color: "#FF9800" },
  Services: { icon: "🔧", color: "#009688" },
  Jobs: { icon: "💼", color: "#673AB7" },
};

const languages = [
  { value: "Turkish", label: "🇹🇷 Türkçe" },
  { value: "English", label: "🇬🇧 English" },
  { value: "Arabic", label: "🇸🇦 العربية" },
  { value: "German", label: "🇩🇪 Deutsch" },
  { value: "French", label: "🇫🇷 Français" },
  { value: "Spanish", label: "🇪🇸 Español" },
  { value: "Russian", label: "🇷🇺 Русский" },
  { value: "Chinese", label: "🇨🇳 中文" },
  { value: "Japanese", label: "🇯🇵 日本語" },
  { value: "Korean", label: "🇰🇷 한국어" },
];

const countries = [
  { value: "Türkiye", label: "🇹🇷 Türkiye" },
  { value: "United States", label: "🇺🇸 ABD" },
  { value: "United Kingdom", label: "🇬🇧 İngiltere" },
  { value: "Germany", label: "🇩🇪 Almanya" },
  { value: "France", label: "🇫🇷 Fransa" },
  { value: "Spain", label: "🇪🇸 İspanya" },
  { value: "Italy", label: "🇮🇹 İtalya" },
  { value: "Saudi Arabia", label: "🇸🇦 Suudi Arabistan" },
  { value: "United Arab Emirates", label: "🇦🇪 BAE" },
  { value: "China", label: "🇨🇳 Çin" },
  { value: "Japan", label: "🇯🇵 Japonya" },
  { value: "South Korea", label: "🇰🇷 Güney Kore" },
  { value: "Russia", label: "🇷🇺 Rusya" },
];

const initialPlaces: Place[] = [
  {
    name: "Pi Stay Ankara",
    category: "Stays",
    lat: 39.9334,
    lng: 32.8597,
    description: "Pi-powered accommodation",
    language: "Turkish",
    country: "Türkiye",
  },
  {
    name: "Pi Market",
    category: "Shops",
    lat: 39.925,
    lng: 32.85,
    description: "Pi-powered shop",
    language: "Turkish",
    country: "Türkiye",
  },
  {
    name: "Pi Food",
    category: "Food",
    lat: 39.94,
    lng: 32.87,
    description: "Pi-powered food business",
    language: "Turkish",
    country: "Türkiye",
  },
  {
    name: "Pi Services",
    category: "Services",
    lat: 39.92,
    lng: 32.88,
    description: "Pi-powered service",
    language: "Turkish",
    country: "Türkiye",
  },
  {
    name: "Pi Jobs",
    category: "Jobs",
    lat: 39.95,
    lng: 32.84,
    description: "Pi Economy job listing",
    language: "Turkish",
    country: "Türkiye",
  },
];

function distanceInKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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

  const [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [username, setUsername] = useState("");

  const [places, setPlaces] =
    useState<Place[]>(initialPlaces);

  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const [searchText, setSearchText] =
    useState("");

  const [activeLanguage, setActiveLanguage] =
    useState("All");

  const [activeCountry, setActiveCountry] =
    useState("All");

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

  const [placeLanguage, setPlaceLanguage] =
    useState("Turkish");

  const [placeCountry, setPlaceCountry] =
    useState("Türkiye");

  const mapRef =
    useRef<HTMLDivElement | null>(null);

  const mapInstance =
    useRef<L.Map | null>(null);

  const markersRef =
    useRef<L.Marker[]>([]);

  const userMarkerRef =
    useRef<L.Marker | null>(null);

  const loginWithPi = async () => {
    try {
      const pi = (window as any).Pi;

      if (!pi) {
        setStatus("Pi SDK yüklenemedi.");
        return;
      }

      await pi.init({
        version: "2.0",
        sandbox: false,
      });

      const auth = await pi.authenticate(
        ["username"],
        () => true
      );

      if (
        !auth?.user?.username ||
        !auth?.accessToken
      ) {
        throw new Error(
          "Pi kullanıcı bilgisi veya erişim anahtarı alınamadı."
        );
      }

      const signinResponse =
        await fetch(
          `${backendUrl}/user/signin`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              authResult: auth,
            }),
          }
        );

      let signinData: any = {};

      try {
        signinData =
          await signinResponse.json();
      } catch {
        signinData = {};
      }

      if (!signinResponse.ok) {
        throw new Error(
          signinData?.message ||
            "PioneerMap backend giriş işlemi başarısız oldu."
        );
      }

      setSignedIn(true);
      setUsername(auth.user.username);

      setStatus(
        `Hoş geldin @${auth.user.username}`
      );
    } catch (error) {
      console.error(
        "Pi login error:",
        error
      );

      setSignedIn(false);
      setUsername("");

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Pi Sign-In başarısız oldu."
      );
    }
  };

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response =
          await fetch(
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
              .bindPopup(
                "📍 Konumunuz"
              );
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
        "π Silmek için önce Pi ile giriş yapmalısın."
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

      const response =
        await fetch(
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

  useEffect(() => {
    const map =
      mapInstance.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach(
      (marker) =>
        marker.remove()
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

        const languageMatch =
          activeLanguage === "All" ||
          (place.language || "") ===
            activeLanguage;

        const countryMatch =
          activeCountry === "All" ||
          (place.country || "") ===
            activeCountry;

        const text = [
          place.name,
          place.description,
          place.username || "",
          place.category,
          place.language || "",
          place.country || "",
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
          languageMatch &&
          countryMatch &&
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
          place._id ||
          `${place.name}-${place.lat}-${place.lng}`;

        marker.bindPopup(`
          <div style="
            min-width:220px;
            text-align:center;
            font-family:Arial,sans-serif;
          ">
            <div style="
              font-size:34px;
              margin-bottom:6px;
            ">
              ${category.icon}
            </div>

            <div style="
              font-size:19px;
              font-weight:700;
              margin-bottom:5px;
            ">
              ${place.name}
            </div>

            <div style="
              color:#666;
              font-size:14px;
              line-height:1.4;
            ">
              ${place.description}
            </div>

            ${
              place.username
                ? `
                  <div style="
                    margin-top:8px;
                    color:#7b1fa2;
                    font-weight:700;
                  ">
                    👤 @${place.username}
                  </div>
                `
                : ""
            }

            ${
              place.language
                ? `
                  <div style="
                    margin-top:7px;
                    color:#555;
                    font-size:13px;
                  ">
                    🌐 ${place.language}
                  </div>
                `
                : ""
            }

            ${
              place.country
                ? `
                  <div style="
                    margin-top:4px;
                    color:#555;
                    font-size:13px;
                  ">
                    🌍 ${place.country}
                  </div>
                `
                : ""
            }

            <div style="
              display:inline-block;
              margin-top:8px;
              padding:5px 12px;
              border-radius:20px;
              background:${category.color};
              color:white;
              font-weight:700;
              font-size:12px;
            ">
              ${place.category}
            </div>

            ${
              distance !== null
                ? `
                  <div style="
                    margin-top:8px;
                    color:#1976D2;
                    font-weight:700;
                  ">
                    📍 ${distance.toFixed(
                      1
                    )} km
                  </div>
                `
                : ""
            }

            <button
              id="details-${safeId}"
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
                  `details-${safeId}`
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
    activeLanguage,
    activeCountry,
    searchText,
    nearbyOnly,
    userLocation,
  ]);

  const addPlace = async () => {
    if (!signedIn) {
      setStatus(
        "π Önce Pi ile giriş yapmalısın."
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
      language: placeLanguage,
      country: placeCountry,
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

        language:
          data.language ||
          newPlace.language,

        country:
          data.country ||
          newPlace.country,
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
      setPlaceLanguage("Turkish");
      setPlaceCountry("Türkiye");
      setSelectedLocation(null);
      setShowForm(false);

      setStatus(
        `✅ ${savedPlace.name} kaydedildi. @${savedPlace.username || username}`
      );
    } catch (error) {
      console.error(
        "Add place error:",
        error
      );

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Yer kaydedilemedi. Backend bağlantısını kontrol et."
      );
    }
  };

  const categories: Array<{
    name: Category;
    icon: string;
  }> = [
    { name: "All", icon: "🌍" },
    { name: "Stays", icon: "🏠" },
    { name: "Shops", icon: "🛍️" },
    { name: "Food", icon: "🍔" },
    { name: "Services", icon: "🔧" },
    { name: "Jobs", icon: "💼" },
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
            margin: "0 0 12px",
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
            fontSize: "17px",
            lineHeight: "1.45",
          }}
        >
          Discover Pi-powered
          stores, products,
          services, and
          businesses near you.
        </p>

        {!signedIn ? (
          <button
            onClick={
              loginWithPi
            }
            style={{
              padding:
                "13px 25px",
              border: "none",
              borderRadius: "10px",
              background:
                "#1976D2",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 3px 10px rgba(25,118,210,.25)",
            }}
          >
            <span
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                width: "25px",
                height: "25px",
                marginRight: "7px",
                borderRadius:
                  "50%",
                background:
                  "#ffffff",
                color: "#1976D2",
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              π
            </span>
            Sign in with Pi
          </button>
        ) : (
          <div
            style={{
              display:
                "inline-block",
              padding:
                "12px 20px",
              borderRadius:
                "10px",
              background:
                "#e8f5e9",
              color:
                "#2e7d32",
              fontWeight:
                "700",
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
              margin:
                "14px 0 0",
              fontWeight: "700",
            }}
          >
            {status}
          </p>
        )}
      </header>

      <section
        style={{
          background:
            "#ffffff",
          padding: "15px",
        }}
      >
        <div
          style={{
            maxWidth:
              "700px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position:
                "relative",
            }}
          >
            <input
              value={
                searchText
              }
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="🔎 Yer, işletme veya kullanıcı ara..."
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "15px 45px 15px 18px",
                borderRadius:
                  "30px",
                border:
                  "2px solid #ddd",
                fontSize: "16px",
                outline: "none",
              }}
            />

            {searchText && (
              <button
                onClick={() =>
                  setSearchText("")
                }
                style={{
                  position:
                    "absolute",
                  right: "10px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  width: "32px",
                  height: "32px",
                  borderRadius:
                    "50%",
                  border: "none",
                  background:
                    "#eee",
                  fontSize: "20px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={() =>
              nearbyOnly
                ? showAllPlaces()
                : findNearbyPlaces()
            }
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "14px",
              border: "none",
              borderRadius:
                "28px",
              background:
                nearbyOnly
                  ? "#d32f2f"
                  : "#1976D2",
              color:
                "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {nearbyOnly
              ? "🌍 Tüm Yerleri Göster"
              : "📍 Yakınımdaki Yerler"}
          </button>

          {nearbyOnly &&
            userLocation && (
              <div
                style={{
                  marginTop:
                    "10px",
                  padding: "11px",
                  borderRadius:
                    "12px",
                  background:
                    "#e3f2fd",
                  color:
                    "#1565c0",
                  textAlign:
                    "center",
                  fontWeight:
                    "700",
                }}
              >
                📍 Konumun bulundu
                <br />
                📏 En yakın yerler
                önce gösteriliyor
              </div>
            )}
        </div>
      </section>

      <section
        style={{
          background:
            "#ffffff",
          padding:
            "0 15px 15px",
          display: "flex",
          gap: "8px",
          justifyContent:
            "center",
          flexWrap: "wrap",
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
                  "10px 16px",
                borderRadius:
                  "22px",
                border:
                  "1px solid #ddd",
                background:
                  activeCategory ===
                  category.name
                    ? "#f1c40f"
                    : "#ffffff",
                fontWeight:
                  activeCategory ===
                  category.name
                    ? "700"
                    : "400",
                fontSize:
                  "15px",
                cursor:
                  "pointer",
              }}
            >
              {
                category.icon
              }{" "}
              {
                category.name
              }
            </button>
          )
        )}

        <select
          value={
            activeLanguage
          }
          onChange={(event) =>
            setActiveLanguage(
              event.target.value
            )
          }
          style={{
            padding:
              "10px 14px",
            borderRadius:
              "22px",
            border:
              "1px solid #ddd",
            background:
              "#fff",
            fontSize:
              "15px",
            cursor:
              "pointer",
          }}
        >
          <option value="All">
            🌐 Dil
          </option>

          {languages.map(
            (language) => (
              <option
                key={
                  language.value
                }
                value={
                  language.value
                }
              >
                {language.label}
              </option>
            )
          )}
        </select>

        <select
          value={
            activeCountry
          }
          onChange={(event) =>
            setActiveCountry(
              event.target.value
            )
          }
          style={{
            padding:
              "10px 14px",
            borderRadius:
              "22px",
            border:
              "1px solid #ddd",
            background:
              "#fff",
            fontSize:
              "15px",
            cursor:
              "pointer",
          }}
        >
          <option value="All">
            🌍 Ülke
          </option>

          {countries.map(
            (country) => (
              <option
                key={
                  country.value
                }
                value={
                  country.value
                }
              >
                {country.label}
              </option>
            )
          )}
        </select>

        <button
          onClick={() =>
            setShowForm(true)
          }
          style={{
            padding:
              "10px 18px",
            borderRadius:
              "22px",
            border: "none",
            background:
              "#222",
            color: "#fff",
            fontWeight:
              "700",
            fontSize:
              "15px",
            cursor:
              "pointer",
          }}
        >
          📍 Add Place
        </button>
      </section>

      {showForm && (
        <section
          style={{
            margin: "15px",
            padding: "20px",
            background:
              "#ffffff",
            borderRadius:
              "14px",
            boxShadow:
              "0 3px 14px rgba(0,0,0,.12)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            📍 Add Place
          </h2>

          <p>
            Haritaya dokunarak
            konum seçebilirsin.
          </p>

          {selectedLocation && (
            <p
              style={{
                color:
                  "#2e7d32",
                fontWeight:
                  "700",
              }}
            >
              ✅ Konum seçildi
            </p>
          )}

          <input
            value={
              placeName
            }
            onChange={(event) =>
              setPlaceName(
                event.target.value
              )
            }
            placeholder="Yer adı"
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              padding: "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
              fontSize:
                "15px",
            }}
          />

          <select
            value={
              placeCategory
            }
            onChange={(event) =>
              setPlaceCategory(
                event.target
                  .value as Exclude<
                  Category,
                  "All"
                >
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
              fontSize:
                "15px",
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

          <select
            value={
              placeLanguage
            }
            onChange={(event) =>
              setPlaceLanguage(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
              fontSize:
                "15px",
            }}
          >
            {languages.map(
              (language) => (
                <option
                  key={
                    language.value
                  }
                  value={
                    language.value
                  }
                >
                  {language.label}
                </option>
              )
            )}
          </select>

          <select
            value={
              placeCountry
            }
            onChange={(event) =>
              setPlaceCountry(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
              fontSize:
                "15px",
            }}
          >
            {countries.map(
              (country) => (
                <option
                  key={
                    country.value
                  }
                  value={
                    country.value
                  }
                >
                  {country.label}
                </option>
              )
            )}
          </select>

          <textarea
            value={
              placeDescription
            }
            onChange={(event) =>
              setPlaceDescription(
                event.target.value
              )
            }
            placeholder="Açıklama"
            rows={4}
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              padding: "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
              fontSize:
                "15px",
            }}
          />

          <button
            onClick={addPlace}
            style={{
              padding:
                "12px 20px",
              border: "none",
              borderRadius:
                "9px",
              background:
                "#2e7d32",
              color: "#fff",
              fontWeight:
                "700",
              cursor:
                "pointer",
              marginRight:
                "8px",
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
                "12px 20px",
              border: "none",
              borderRadius:
                "9px",
              background:
                "#777",
              color: "#fff",
              fontWeight:
                "700",
              cursor:
                "pointer",
            }}
          >
            İptal
          </button>

          {selectedLocation && (
            <div
              style={{
                marginTop:
                  "15px",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                background:
                  "#f5f5f5",
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
        </section>
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
            borderRadius:
              "14px",
            overflow:
              "hidden",
            background:
              "#ddd",
          }}
        />

        {selectedPlace &&
          selectedCategory && (
            <section
              id="pioneer-detail-card"
              style={{
                marginTop:
                  "16px",
                background:
                  "#ffffff",
                borderRadius:
                  "18px",
                overflow:
                  "hidden",
                boxShadow:
                  "0 4px 18px rgba(0,0,0,.16)",
                borderTop:
                  `7px solid ${selectedCategory.color}`,
              }}
            >
              <div
                style={{
                  padding:
                    "20px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          "42px",
                      }}
                    >
                      {
                        selectedCategory.icon
                      }
                    </div>

                    <h2
                      style={{
                        margin:
                          "6px 0 0",
                        fontSize:
                          "25px",
                      }}
                    >
                      {
                        selectedPlace.name
                      }
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedPlace(
                        null
                      )
                    }
                    style={{
                      width: "38px",
                      height:
                        "38px",
                      borderRadius:
                        "50%",
                      border:
                        "none",
                      background:
                        "#eeeeee",
                      fontSize:
                        "22px",
                      cursor:
                        "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    display:
                      "inline-block",
                    marginTop:
                      "10px",
                    padding:
                      "7px 14px",
                    borderRadius:
                      "20px",
                    background:
                      selectedCategory.color,
                    color:
                      "#ffffff",
                    fontWeight:
                      "700",
                    fontSize:
                      "13px",
                  }}
                >
                  {
                    selectedPlace.category
                  }
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                    flexWrap:
                      "wrap",
                    marginTop:
                      "12px",
                  }}
                >
                  {selectedPlace.language && (
                    <div
                      style={{
                        padding:
                          "8px 12px",
                        borderRadius:
                          "20px",
                        background:
                          "#e3f2fd",
                        color:
                          "#1565c0",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      🌐{" "}
                      {
                        selectedPlace.language
                      }
                    </div>
                  )}

                  {selectedPlace.country && (
                    <div
                      style={{
                        padding:
                          "8px 12px",
                        borderRadius:
                          "20px",
                        background:
                          "#e8f5e9",
                        color:
                          "#2e7d32",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      🌍{" "}
                      {
                        selectedPlace.country
                      }
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop:
                      "16px",
                    padding:
                      "15px",
                    borderRadius:
                      "12px",
                    background:
                      "#f7f7f7",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "13px",
                      color:
                        "#777",
                      fontWeight:
                        "700",
                      marginBottom:
                        "5px",
                    }}
                  >
                    AÇIKLAMA
                  </div>

                  <div
                    style={{
                      fontSize:
                        "16px",
                      lineHeight:
                        "1.5",
                    }}
                  >
                    {
                      selectedPlace.description
                    }
                  </div>
                </div>

                {selectedPlace.username && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                      padding:
                        "13px",
                      borderRadius:
                        "12px",
                      background:
                        "#f3e5f5",
                      color:
                        "#7b1fa2",
                      fontWeight:
                        "700",
                    }}
                  >
                    👤 @
                    {
                      selectedPlace.username
                    }
                  </div>
                )}

                {selectedDistance !==
                  null && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                      padding:
                        "13px",
                      borderRadius:
                        "12px",
                      background:
                        "#e3f2fd",
                      color:
                        "#1565c0",
                      fontWeight:
                        "700",
                    }}
                  >
                    📍{" "}
                    {selectedDistance.toFixed(
                      1
                    )}{" "}
                    km uzaklıkta
                  </div>
                )}

                <div
                  style={{
                    marginTop:
                      "10px",
                    padding:
                      "13px",
                    borderRadius:
                      "12px",
                    background:
                      "#fafafa",
                    color:
                      "#555",
                    fontSize:
                      "13px",
                  }}
                >
                  🗺️ Konum:{" "}
                  {selectedPlace.lat.toFixed(
                    5
                  )}
                  ,{" "}
                  {selectedPlace.lng.toFixed(
                    5
                  )}
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "9px",
                    flexWrap:
                      "wrap",
                    marginTop:
                      "15px",
                  }}
                >
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

                        setTimeout(
                          () => {
                            const card =
                              document.getElementById(
                                "pioneer-detail-card"
                              );

                            if (card) {
                              card.scrollIntoView(
                                {
                                  behavior:
                                    "smooth",
                                  block:
                                    "start",
                                }
                              );
                            }
                          },
                          100
                        );
                      }
                    }}
                    style={{
                      flex:
                        "1",
                      minWidth:
                        "160px",
                      padding:
                        "13px",
                      border:
                        "none",
                      borderRadius:
                        "10px",
                      background:
                        "#1976D2",
                      color:
                        "#ffffff",
                      fontWeight:
                        "700",
                      cursor:
                        "pointer",
                    }}
                  >
                    🗺️ Haritada Göster
                  </button>

                  {signedIn &&
                    username &&
                    selectedPlace.username ===
                      username && (
                      <button
                        onClick={() =>
                          deletePlace(
                            selectedPlace
                          )
                        }
                        style={{
                          flex:
                            "1",
                          minWidth:
                            "160px",
                          padding:
                            "13px",
                          border:
                            "none",
                          borderRadius:
                            "10px",
                          background:
                            "#d32f2f",
                          color:
                            "#ffffff",
                          fontWeight:
                            "700",
                          cursor:
                            "pointer",
                        }}
                      >
                        🗑️ Yeri Sil
                      </button>
                    )}
                </div>
              </div>
            </section>
          )}

        <div
          style={{
            textAlign:
              "center",
            fontWeight:
              "700",
            padding:
              "15px 5px",
          }}
        >
          {nearbyOnly &&
          userLocation
            ? "📍 50 km içindeki yerler — en yakından uzağa"
            : searchText.trim()
            ? `🔎 "${searchText}" sonuçları`
            : activeLanguage !==
                "All"
            ? `🌐 ${activeLanguage}`
            : activeCountry !==
                "All"
            ? `🌍 ${activeCountry}`
            : activeCategory ===
              "All"
            ? "🌍 Pi Economy Places"
            : `${
                categories.find(
                  (item) =>
                    item.name ===
                    activeCategory
                )?.icon
              } ${activeCategory}`}
        </div>
      </main>
    </div>
  );
}

export default PioneerMapPage;
