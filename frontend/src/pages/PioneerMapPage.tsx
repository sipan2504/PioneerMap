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
    color: "#00A6A6",
  },
  Jobs: {
    icon: "💼",
    color: "#673AB7",
  },
};

function distanceInKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
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
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

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
        box-shadow:0 4px 10px rgba(0,0,0,.3);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          font-size:23px;
        ">${icon}</span>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
    popupAnchor: [0, -55],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "user-location-marker",
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

  const [nearbyOnly, setNearbyOnly] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState<{
      lat: number;
      lng: number;
    } | null>(null);

  /*
   * ÖNEMLİ:
   * Kartı doğrudan Place objesi yerine ID ile takip ediyoruz.
   * Böylece Leaflet markerları yeniden çizildiğinde
   * detay kartı kaybolmuyor.
   */
  const [selectedPlaceId, setSelectedPlaceId] =
    useState<string | null>(null);

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
   * Seçili yeri places listesinden buluyoruz.
   * ID yoksa isim + koordinat ile güvenli şekilde buluyoruz.
   */
  const selectedPlace =
    selectedPlaceId
      ? places.find(
          (place) =>
            place._id === selectedPlaceId
        ) || null
      : null;

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

      const auth =
        await window.Pi.authenticate(
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

      setStatus(
        "Pi Sign-In başarısız oldu."
      );
    }
  };

  /*
   * MongoDB'den yerleri getir
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
            `Places request failed: ${response.status}`
          );
        }

        const data =
          await response.json();

        if (Array.isArray(data)) {
          /*
           * Backend'den boş liste gelirse
           * örnek yerleri silmiyoruz.
           */
          if (data.length > 0) {
            setPlaces(data);
          }
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

  /*
   * Leaflet haritasını oluştur
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

    /*
     * Haritaya tıklayınca Add Place formu açılır.
     */
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

  /*
   * Yakınımdaki Yerler
   */
  const findNearbyPlaces = () => {
    if (!navigator.geolocation) {
      setStatus(
        "❌ Bu cihaz konum özelliğini desteklemiyor."
      );

      return;
    }

    setStatus(
      "📍 Konumun alınıyor..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat:
            position.coords.latitude,
          lng:
            position.coords.longitude,
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
        }

        if (map) {
          userMarkerRef.current =
            L.marker(
              [
                location.lat,
                location.lng,
              ],
              {
                icon:
                  createUserIcon(),
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
          "Konum hatası:",
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
   * Tüm yerleri göster
   */
  const showAllPlaces = () => {
    setNearbyOnly(false);
    setUserLocation(null);

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    setStatus(
      "🌍 Tüm yerler gösteriliyor."
    );
  };

  /*
   * Yer sil
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
        if (
          response.status === 401
        ) {
          throw new Error(
            "Oturum bulunamadı. Pi ile tekrar giriş yap."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "Bu yeri sadece sahibi silebilir."
          );
        }

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

      setSelectedPlaceId(null);

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

  /*
   * MARKERLARI OLUŞTUR
   *
   * Buradaki önemli değişiklik:
   * Popup içindeki Detayları Gör butonu
   * artık DOM ID'sine bağlı değil.
   *
   * Marker tıklandığında doğrudan
   * selectedPlaceId belirleniyor.
   */
  useEffect(() => {
    const map =
      mapInstance.current;

    if (!map) {
      return;
    }

    /*
     * Eski markerları temizle
     */
    markersRef.current.forEach(
      (marker) => marker.remove()
    );

    markersRef.current = [];

    const normalizedSearch =
      searchText
        .trim()
        .toLowerCase();

    let filteredPlaces =
      places.filter((place) => {
        const matchesCategory =
          activeCategory === "All" ||
          place.category ===
            activeCategory;

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

        const distance =
          userLocation
            ? distanceInKm(
                userLocation.lat,
                userLocation.lng,
                place.lat,
                place.lng
              )
            : null;

        const matchesNearby =
          !nearbyOnly ||
          !userLocation ||
          distance! <= 50;

        return (
          matchesCategory &&
          matchesSearch &&
          matchesNearby
        );
      });

    /*
     * Yakındaki yerleri mesafeye göre sırala
     */
    if (userLocation) {
      filteredPlaces =
        filteredPlaces.sort(
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
      (place, index) => {
        const distance =
          userLocation
            ? distanceInKm(
                userLocation.lat,
                userLocation.lng,
                place.lat,
                place.lng
              )
            : null;

        /*
         * ID yoksa bile marker için
         * güvenli bir geçici ID oluştur.
         */
        const placeKey =
          place._id ||
          `${place.name}-${place.lat}-${place.lng}-${index}`;

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

        /*
         * Popup
         */
        marker.bindPopup(`
          <div style="
            min-width:210px;
            text-align:center;
            font-family:Arial,sans-serif;
          ">

            <div style="
              font-size:32px;
              margin-bottom:5px;
            ">
              ${
                categoryIcons[
                  place.category
                ].icon
              }
            </div>

            <strong style="
              display:block;
              font-size:18px;
              margin-bottom:7px;
            ">
              ${place.name}
            </strong>

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
                    font-weight:bold;
                  ">
                    👤 @${place.username}
                  </div>
                `
                : ""
            }

            <div style="
              display:inline-block;
              margin-top:8px;
              padding:5px 12px;
              border-radius:15px;
              background:${
                categoryIcons[
                  place.category
                ].color
              };
              color:white;
              font-size:12px;
              font-weight:bold;
            ">
              ${place.category}
            </div>

            ${
              distance !== null
                ? `
                  <div style="
                    margin-top:8px;
                    color:#1976D2;
                    font-weight:bold;
                  ">
                    📍 ${distance.toFixed(
                      1
                    )} km
                  </div>
                `
                : ""
            }

            <div style="
              margin-top:10px;
              color:#1976D2;
              font-weight:bold;
              font-size:13px;
            ">
              👆 Detaylar için pine tekrar dokun
            </div>

          </div>
        `);

        /*
         * PIN TIKLANDIĞINDA:
         * Detay kartını aç.
         *
         * Burada kartın kaybolmasına neden
         * olabilecek DOM button olayını
         * tamamen kaldırdık.
         */
        marker.on("click", () => {
          setSelectedPlaceId(
            placeKey
          );
        });

        /*
         * Popup açıldığında da seçili yeri belirle.
         */
        marker.on(
          "popupopen",
          () => {
            setSelectedPlaceId(
              placeKey
            );
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
   * YER EKLE
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
        "Yer adını yaz."
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
      name:
        placeName.trim(),
      category:
        placeCategory,
      lat:
        location.lat,
      lng:
        location.lng,
      description:
        placeDescription.trim() ||
        "Pi Economy place",
      username:
        username ||
        undefined,
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
        _id:
          data._id,
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

      /*
       * Yeni eklenen yeri otomatik
       * olarak detay kartında göster.
       */
      if (savedPlace._id) {
        setSelectedPlaceId(
          savedPlace._id
        );
      }

      if (map) {
        map.setView(
          [
            savedPlace.lat,
            savedPlace.lng,
          ],
          Math.max(
            map.getZoom(),
            10
          )
        );
      }

      setPlaceName("");
      setPlaceDescription("");
      setPlaceCategory(
        "Stays"
      );
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

  /*
   * Seçili yerin mesafesi
   */
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

  /*
   * Seçili yer bana mı ait?
   */
  const selectedPlaceIsMine =
    !!selectedPlace &&
    signedIn &&
    !!username &&
    selectedPlace.username ===
      username;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "#f5f7fa",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding:
            "20px",
          textAlign:
            "center",
          background:
            "#ffffff",
        }}
      >
        <h1
          style={{
            margin:
              "0 0 10px",
          }}
        >
          🗺️ PioneerMap
        </h1>

        <p
          style={{
            margin:
              "0 0 15px",
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
                "12px 24px",
              fontSize:
                "16px",
              borderRadius:
                "8px",
              border:
                "none",
              cursor:
                "pointer",
            }}
          >
            🔐 Sign in with Pi
          </button>
        ) : (
          <div
            style={{
              display:
                "inline-block",
              padding:
                "12px 24px",
              borderRadius:
                "8px",
              background:
                "#e8f5e9",
              color:
                "#2e7d32",
              fontWeight:
                "bold",
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
              fontWeight:
                "bold",
              marginTop:
                "12px",
            }}
          >
            {status}
          </p>
        )}
      </header>

      {/* SEARCH + NEARBY */}
      <div
        style={{
          padding:
            "15px",
          background:
            "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth:
              "700px",
            margin:
              "0 auto",
            position:
              "relative",
          }}
        >
          <input
            value={
              searchText
            }
            onChange={(
              event
            ) =>
              setSearchText(
                event.target
                  .value
              )
            }
            placeholder="🔎 Yer, işletme veya kullanıcı ara..."
            style={{
              width:
                "100%",
              boxSizing:
                "border-box",
              padding:
                "15px 45px 15px 18px",
              borderRadius:
                "30px",
              border:
                "2px solid #ddd",
              fontSize:
                "16px",
              outline:
                "none",
            }}
          />

          {searchText && (
            <button
              onClick={() =>
                setSearchText(
                  ""
                )
              }
              style={{
                position:
                  "absolute",
                right:
                  "10px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
                width:
                  "32px",
                height:
                  "32px",
                borderRadius:
                  "50%",
                border:
                  "none",
                background:
                  "#eee",
                cursor:
                  "pointer",
                fontSize:
                  "18px",
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
            display:
              "block",
            width:
              "100%",
            maxWidth:
              "700px",
            margin:
              "10px auto 0",
            padding:
              "13px",
            borderRadius:
              "25px",
            border:
              "none",
            background:
              nearbyOnly
                ? "#d32f2f"
                : "#1976D2",
            color:
              "#fff",
            fontWeight:
              "bold",
            fontSize:
              "16px",
            cursor:
              "pointer",
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
                maxWidth:
                  "700px",
                margin:
                  "10px auto 0",
                padding:
                  "10px",
                borderRadius:
                  "12px",
                background:
                  "#e3f2fd",
                color:
                  "#1565c0",
                textAlign:
                  "center",
                fontWeight:
                  "bold",
              }}
            >
              📍 Konumun bulundu
              <br />
              📏 En yakın yerler
              önce gösteriliyor
            </div>
          )}
      </div>

      {/* CATEGORIES */}
      <div
        style={{
          padding:
            "0 15px 15px",
          display:
            "flex",
          gap:
            "8px",
          justifyContent:
            "center",
          flexWrap:
            "wrap",
          background:
            "#ffffff",
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
                  "10px 15px",
                borderRadius:
                  "20px",
                border:
                  "1px solid #ddd",
                cursor:
                  "pointer",
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
              {
                category.icon
              }{" "}
              {
                category.name
              }
            </button>
          )
        )}

        <button
          onClick={() =>
            setShowForm(
              true
            )
          }
          style={{
            padding:
              "10px 18px",
            borderRadius:
              "20px",
            border:
              "none",
            background:
              "#222",
            color:
              "#fff",
            cursor:
              "pointer",
            fontWeight:
              "bold",
          }}
        >
          📍 Add Place
        </button>
      </div>

      {/* ADD PLACE FORM */}
      {showForm && (
        <div
          style={{
            margin:
              "15px",
            padding:
              "20px",
            background:
              "#ffffff",
            borderRadius:
              "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,.12)",
          }}
        >
          <h2>
            📍 Add Place
          </h2>

          <p>
            Haritaya
            dokunursan o
            konum kullanılır.
            Dokunmazsan
            harita merkezi
            kullanılır.
          </p>

          {selectedLocation && (
            <p
              style={{
                color:
                  "#2e7d32",
                fontWeight:
                  "bold",
              }}
            >
              ✅ Konum seçildi
            </p>
          )}

          <input
            value={
              placeName
            }
            onChange={(
              event
            ) =>
              setPlaceName(
                event.target
                  .value
              )
            }
            placeholder="Yer adı"
            style={{
              width:
                "100%",
              boxSizing:
                "border-box",
              padding:
                "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
            }}
          />

          <select
            value={
              placeCategory
            }
            onChange={(
              event
            ) =>
              setPlaceCategory(
                event.target
                  .value as Exclude<
                  Category,
                  "All"
                >
              )
            }
            style={{
              width:
                "100%",
              padding:
                "12px",
              marginBottom:
                "10px",
              borderRadius:
                "8px",
              border:
                "1px solid #ccc",
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
