import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Toast from "../components/Toast";
import "leaflet/dist/leaflet.css";
import Favorites from "../components/Favorites";
import PlaceDetails from "../components/PlaceDetails";
import PlaceList from "../components/PlaceList";
import AddPlaceForm from "../components/AddPlaceForm";
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
  image?: string;
};

type AppLanguage =
  | "Turkish"
  | "English"
  | "Arabic"
  | "Spanish"
  | "French"
  | "German"
  | "Portuguese"
  | "Russian"
  | "Chinese"
  | "Hindi";

const compressPlaceImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Fotoğraf okunamadı."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Fotoğraf yüklenemedi."));
      img.onload = () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Fotoğraf işlenemedi."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const result = canvas.toDataURL("image/jpeg", 0.72);
        if (result.length > 2300000) {
          resolve(canvas.toDataURL("image/jpeg", 0.55));
        } else {
          resolve(result);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
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

/* =========================================================
FEATURE #4
PLACE LANGUAGE + COUNTRY DATA
========================================================= */

const languages = [
  { value: "Turkish", label: "🇹🇷 Türkçe" },
  { value: "English", label: "🇬🇧 English" },
  { value: "Arabic", label: "🇸🇦 العربية" },
  { value: "Chinese", label: "🇨🇳 中文" },
  { value: "Hindi", label: "🇮🇳 हिन्दी" },
  { value: "Spanish", label: "🇪🇸 Español" },
  { value: "French", label: "🇫🇷 Français" },
  { value: "Portuguese", label: "🇵🇹 Português" },
  { value: "Russian", label: "🇷🇺 Русский" },
  { value: "Bengali", label: "🇧🇩 বাংলা" },
  { value: "German", label: "🇩🇪 Deutsch" },
  { value: "Japanese", label: "🇯🇵 日本語" },
  { value: "Korean", label: "🇰🇷 한국어" },
  { value: "Persian", label: "🇮🇷 فارسی" },
  { value: "Italian", label: "🇮🇹 Italiano" },
  { value: "Urdu", label: "🇵🇰 اردو" },
  { value: "Vietnamese", label: "🇻🇳 Tiếng Việt" },
  { value: "Telugu", label: "🇮🇳 తెలుగు" },
  { value: "Marathi", label: "🇮🇳 मराठी" },
  { value: "Tamil", label: "🇮🇳 தமிழ்" },
  { value: "Yue Chinese", label: "🇭🇰 粵語" },
  { value: "Wu Chinese", label: "🇨🇳 吴语" },
  { value: "Gujarati", label: "🇮🇳 ગુજરાતી" },
  { value: "Kannada", label: "🇮🇳 ಕನ್ನಡ" },
  { value: "Polish", label: "🇵🇱 Polski" },
  { value: "Ukrainian", label: "🇺🇦 Українська" },
  { value: "Malay", label: "🇲🇾 Bahasa Melayu" },
  { value: "Malayalam", label: "🇮🇳 മലയാളം" },
  { value: "Odia", label: "🇮🇳 ଓଡ଼ିଆ" },
  { value: "Punjabi", label: "🇮🇳 ਪੰਜਾਬੀ" },
  { value: "Romanian", label: "🇷🇴 Română" },
  { value: "Dutch", label: "🇳🇱 Nederlands" },
  { value: "Greek", label: "🇬🇷 Ελληνικά" },
  { value: "Czech", label: "🇨🇿 Čeština" },
  { value: "Swedish", label: "🇸🇪 Svenska" },
  { value: "Hungarian", label: "🇭🇺 Magyar" },
  { value: "Hebrew", label: "🇮🇱 עברית" },
  { value: "Finnish", label: "🇫🇮 Suomi" },
  { value: "Norwegian", label: "🇳🇴 Norsk" },
  { value: "Danish", label: "🇩🇰 Dansk" },
  { value: "Bulgarian", label: "🇧🇬 Български" },
  { value: "Serbian", label: "🇷🇸 Српски" },
  { value: "Croatian", label: "🇭🇷 Hrvatski" },
  { value: "Slovak", label: "🇸🇰 Slovenčina" },
  { value: "Lithuanian", label: "🇱🇹 Lietuvių" },
  { value: "Slovenian", label: "🇸🇮 Slovenščina" },
  { value: "Latvian", label: "🇱🇻 Latviešu" },
  { value: "Estonian", label: "🇪🇪 Eesti" },
  { value: "Thai", label: "🇹🇭 ไทย" },
  { value: "Indonesian", label: "🇮🇩 Bahasa Indonesia" },
];

const countries = [
  { value: "Türkiye", label: "🇹🇷 Türkiye" },
  { value: "United States", label: "🇺🇸 ABD" },
  { value: "Canada", label: "🇨🇦 Kanada" },
  { value: "Mexico", label: "🇲🇽 Meksika" },
  { value: "Brazil", label: "🇧🇷 Brezilya" },
  { value: "Argentina", label: "🇦🇷 Arjantin" },
  { value: "Chile", label: "🇨🇱 Şili" },
  { value: "Colombia", label: "🇨🇴 Kolombiya" },
  { value: "Peru", label: "🇵🇪 Peru" },
  { value: "United Kingdom", label: "🇬🇧 İngiltere" },
  { value: "Ireland", label: "🇮🇪 İrlanda" },
  { value: "France", label: "🇫🇷 Fransa" },
  { value: "Germany", label: "🇩🇪 Almanya" },
  { value: "Italy", label: "🇮🇹 İtalya" },
  { value: "Spain", label: "🇪🇸 İspanya" },
  { value: "Portugal", label: "🇵🇹 Portekiz" },
  { value: "Netherlands", label: "🇳🇱 Hollanda" },
  { value: "Belgium", label: "🇧🇪 Belçika" },
  { value: "Switzerland", label: "🇨🇭 İsviçre" },
  { value: "Austria", label: "🇦🇹 Avusturya" },
  { value: "Sweden", label: "🇸🇪 İsveç" },
  { value: "Norway", label: "🇳🇴 Norveç" },
  { value: "Denmark", label: "🇩🇰 Danimarka" },
  { value: "Finland", label: "🇫🇮 Finlandiya" },
  { value: "Iceland", label: "🇮🇸 İzlanda" },
  { value: "Poland", label: "🇵🇱 Polonya" },
  { value: "Czechia", label: "🇨🇿 Çekya" },
  { value: "Slovakia", label: "🇸🇰 Slovakya" },
  { value: "Hungary", label: "🇭🇺 Macaristan" },
  { value: "Romania", label: "🇷🇴 Romanya" },
  { value: "Bulgaria", label: "🇧🇬 Bulgaristan" },
  { value: "Greece", label: "🇬🇷 Yunanistan" },
  { value: "Ukraine", label: "🇺🇦 Ukrayna" },
  { value: "Serbia", label: "🇷🇸 Sırbistan" },
  { value: "Croatia", label: "🇭🇷 Hırvatistan" },
  { value: "Slovenia", label: "🇸🇮 Slovenya" },
  { value: "Bosnia and Herzegovina", label: "🇧🇦 Bosna-Hersek" },
  { value: "Albania", label: "🇦🇱 Arnavutluk" },
  { value: "Lithuania", label: "🇱🇹 Litvanya" },
  { value: "Latvia", label: "🇱🇻 Letonya" },
  { value: "Estonia", label: "🇪🇪 Estonya" },
  { value: "Russia", label: "🇷🇺 Rusya" },
  { value: "Georgia", label: "🇬🇪 Gürcistan" },
  { value: "Armenia", label: "🇦🇲 Ermenistan" },
  { value: "Azerbaijan", label: "🇦🇿 Azerbaycan" },
  { value: "Kazakhstan", label: "🇰🇿 Kazakistan" },
  { value: "Uzbekistan", label: "🇺🇿 Özbekistan" },
  { value: "China", label: "🇨🇳 Çin" },
  { value: "Japan", label: "🇯🇵 Japonya" },
  { value: "South Korea", label: "🇰🇷 Güney Kore" },
  { value: "India", label: "🇮🇳 Hindistan" },
  { value: "Pakistan", label: "🇵🇰 Pakistan" },
  { value: "Bangladesh", label: "🇧🇩 Bangladeş" },
  { value: "Nepal", label: "🇳🇵 Nepal" },
  { value: "Sri Lanka", label: "🇱🇰 Sri Lanka" },
  { value: "Thailand", label: "🇹🇭 Tayland" },
  { value: "Vietnam", label: "🇻🇳 Vietnam" },
  { value: "Malaysia", label: "🇲🇾 Malezya" },
  { value: "Singapore", label: "🇸🇬 Singapur" },
  { value: "Indonesia", label: "🇮🇩 Endonezya" },
  { value: "Philippines", label: "🇵🇭 Filipinler" },
  { value: "Australia", label: "🇦🇺 Avustralya" },
  { value: "New Zealand", label: "🇳🇿 Yeni Zelanda" },
  { value: "Saudi Arabia", label: "🇸🇦 Suudi Arabistan" },
  { value: "United Arab Emirates", label: "🇦🇪 BAE" },
  { value: "Qatar", label: "🇶🇦 Katar" },
  { value: "Kuwait", label: "🇰🇼 Kuveyt" },
  { value: "Bahrain", label: "🇧🇭 Bahreyn" },
  { value: "Oman", label: "🇴🇲 Umman" },
  { value: "Jordan", label: "🇯🇴 Ürdün" },
  { value: "Lebanon", label: "🇱🇧 Lübnan" },
  { value: "Israel", label: "🇮🇱 İsrail" },
  { value: "Iraq", label: "🇮🇶 Irak" },
  { value: "Iran", label: "🇮🇷 İran" },
  { value: "Egypt", label: "🇪🇬 Mısır" },
  { value: "Morocco", label: "🇲🇦 Fas" },
  { value: "Algeria", label: "🇩🇿 Cezayir" },
  { value: "Tunisia", label: "🇹🇳 Tunus" },
  { value: "Libya", label: "🇱🇾 Libya" },
  { value: "South Africa", label: "🇿🇦 Güney Afrika" },
  { value: "Nigeria", label: "🇳🇬 Nijerya" },
  { value: "Ghana", label: "🇬🇭 Gana" },
  { value: "Kenya", label: "🇰🇪 Kenya" },
  { value: "Ethiopia", label: "🇪🇹 Etiyopya" },
  { value: "Tanzania", label: "🇹🇿 Tanzanya" },
];

/* =========================================================
FEATURE #5
APP LANGUAGE
========================================================= */

const appLanguages: Array<{
  value: AppLanguage;
  label: string;
}> = [
  { value: "Turkish", label: "🇹🇷 Türkçe" },
  { value: "English", label: "🇬🇧 English" },
  { value: "Arabic", label: "🇸🇦 العربية" },
  { value: "Spanish", label: "🇪🇸 Español" },
  { value: "French", label: "🇫🇷 Français" },
  { value: "German", label: "🇩🇪 Deutsch" },
  { value: "Portuguese", label: "🇵🇹 Português" },
  { value: "Russian", label: "🇷🇺 Русский" },
  { value: "Chinese", label: "🇨🇳 中文" },
  { value: "Hindi", label: "🇮🇳 हिन्दी" },
];

const translations = {
  Turkish: {
    appDescription:
      "Pi destekli mağazaları, ürünleri, hizmetleri ve işletmeleri yakınında keşfet.",
    signIn: "π Pi ile Giriş Yap",
    connected: "Pi Bağlandı",
    search: "🔎 Yer, işletme veya kullanıcı ara...",
    nearby: "📍 Yakınımdaki Yerler",
    allPlaces: "🌍 Tüm Yerleri Göster",
    locationFound: "📍 Konumun bulundu",
    nearestFirst: "📏 En yakın yerler önce gösteriliyor",
    all: "Tümü",
    stays: "Konaklama",
    shops: "Mağazalar",
    food: "Yemek",
    services: "Hizmetler",
    jobs: "İşler",
    addPlace: "📍 Yer Ekle",
    language: "Dil",
    country: "Ülke",
    allLanguages: "🗣️ Tüm Diller",
    allCountries: "🌍 Tüm Ülkeler",
    addPlaceTitle: "📍 Yer Ekle",
    tapMap: "Konum seçmek için haritaya dokunabilirsin.",
    locationSelected: "✅ Konum seçildi",
    placeName: "Yer adı",
    description: "Açıklama",
    save: "💾 Kaydet",
    cancel: "İptal",
    selectedLocation: "📍 Seçilen konum",
    details: "📋 Detayları Gör",
    detailsTitle: "Detaylar",
    map: "🗺️ Haritada Göster",
    delete: "🗑️ Yeri Sil",
    close: "Kapat",
    distance: "km uzaklıkta",
    places: "🌍 Pi Economy Yerleri",
    nearbyPlaces: "📍 50 km içindeki yerler — en yakından uzağa",
    results: "sonuçları",
    searchingLocation: "📍 Konumun alınıyor...",
    locationNotSupported: "❌ Konum özelliği desteklenmiyor.",
    locationDenied: "❌ Konum izni verilmedi.",
    signInFirst: "❌ Önce Pi ile giriş yapmalısın.",
    deleteLogin: "❌ Silmek için Pi ile giriş yapmalısın.",
    saving: "⏳ Yer kaydediliyor...",
    deleting: "⏳ Yer siliniyor...",
    deleted: "silindi.",
    saved: "kaydedildi.",
    nameRequired: "❌ Yer adını yaz.",
    descriptionTitle: "AÇIKLAMA",
    languageSelector: "🌐 Uygulama Dili",
    confirmDelete: "yerini silmek istediğine emin misin?",
    piSdkError: "❌ Pi SDK yüklenemedi.",
    piUserError: "Pi kullanıcı bilgisi alınamadı.",
    backendError: "Backend giriş işlemi başarısız.",
    loginFailed: "❌ Pi Sign-In başarısız.",
    locationChosen: "📍 Konum seçildi. Yer bilgilerini gir.",
    location: "📍 Konum",
    anonymous: "Kullanıcı",
  },

  English: {
    appDescription:
      "Discover Pi-powered stores, products, services, and businesses near you.",
    signIn: "π Sign in with Pi",
    connected: "Pi Connected",
    search: "🔎 Search places, businesses or users...",
    nearby: "📍 Nearby Places",
    allPlaces: "🌍 Show All Places",
    locationFound: "📍 Location found",
    nearestFirst: "📏 Nearest places shown first",
    all: "All",
    stays: "Stays",
    shops: "Shops",
    food: "Food",
    services: "Services",
    jobs: "Jobs",
    addPlace: "📍 Add Place",
    language: "Language",
    country: "Country",
    allLanguages: "🗣️ All Languages",
    allCountries: "🌍 All Countries",
    addPlaceTitle: "📍 Add Place",
    tapMap: "Tap the map to select a location.",
    locationSelected: "✅ Location selected",
    placeName: "Place name",
    description: "Description",
    save: "💾 Save",
    cancel: "Cancel",
    selectedLocation: "📍 Selected location",
    details: "📋 View Details",
    detailsTitle: "Details",
    map: "🗺️ Show on Map",
    delete: "🗑️ Delete Place",
    close: "Close",
    distance: "km away",
    places: "🌍 Pi Economy Places",
    nearbyPlaces: "📍 Places within 50 km — nearest first",
    results: "results",
    searchingLocation: "📍 Getting your location...",
    locationNotSupported: "❌ Location is not supported.",
    locationDenied: "❌ Location permission denied.",
    signInFirst: "❌ Please sign in with Pi first.",
    deleteLogin: "❌ You must sign in with Pi to delete.",
    saving: "⏳ Saving place...",
    deleting: "⏳ Deleting place...",
    deleted: "deleted.",
    saved: "saved.",
    nameRequired: "❌ Enter a place name.",
    descriptionTitle: "DESCRIPTION",
    languageSelector: "🌐 App Language",
    confirmDelete: "Are you sure you want to delete this place?",
    piSdkError: "❌ Pi SDK could not be loaded.",
    piUserError: "Pi user information could not be obtained.",
    backendError: "Backend sign-in failed.",
    loginFailed: "❌ Pi Sign-In failed.",
    locationChosen:
      "📍 Location selected. Enter the place information.",
    location: "📍 Location",
    anonymous: "User",
  },

  Arabic: {
    appDescription:
      "اكتشف المتاجر والمنتجات والخدمات والأعمال المدعومة من Pi بالقرب منك.",
    signIn: "π تسجيل الدخول باستخدام Pi",
    connected: "Pi متصل",
    search: "🔎 ابحث عن الأماكن أو الأعمال أو المستخدمين...",
    nearby: "📍 الأماكن القريبة",
    allPlaces: "🌍 عرض جميع الأماكن",
    locationFound: "📍 تم العثور على موقعك",
    nearestFirst: "📏 عرض الأماكن الأقرب أولاً",
    all: "الكل",
    stays: "الإقامات",
    shops: "المتاجر",
    food: "الطعام",
    services: "الخدمات",
    jobs: "الوظائف",
    addPlace: "📍 إضافة مكان",
    language: "اللغة",
    country: "الدولة",
    allLanguages: "🗣️ جميع اللغات",
    allCountries: "🌍 جميع الدول",
    addPlaceTitle: "📍 إضافة مكان",
    tapMap: "اضغط على الخريطة لاختيار الموقع.",
    locationSelected: "✅ تم اختيار الموقع",
    placeName: "اسم المكان",
    description: "الوصف",
    save: "💾 حفظ",
    cancel: "إلغاء",
    selectedLocation: "📍 الموقع المحدد",
    details: "📋 عرض التفاصيل",
    detailsTitle: "التفاصيل",
    map: "🗺️ عرض على الخريطة",
    delete: "🗑️ حذف المكان",
    close: "إغلاق",
    distance: "كم",
    places: "🌍 أماكن Pi Economy",
    nearbyPlaces: "📍 الأماكن ضمن 50 كم — الأقرب أولاً",
    results: "النتائج",
    searchingLocation: "📍 جارٍ تحديد موقعك...",
    locationNotSupported: "❌ الموقع غير مدعوم.",
    locationDenied: "❌ تم رفض إذن الموقع.",
    signInFirst: "❌ يرجى تسجيل الدخول باستخدام Pi أولاً.",
    deleteLogin: "❌ يجب تسجيل الدخول باستخدام Pi للحذف.",
    saving: "⏳ جارٍ حفظ المكان...",
    deleting: "⏳ جارٍ حذف المكان...",
    deleted: "تم حذفه.",
    saved: "تم حفظه.",
    nameRequired: "❌ أدخل اسم المكان.",
    descriptionTitle: "الوصف",
    languageSelector: "🌐 لغة التطبيق",
    confirmDelete: "هل أنت متأكد من حذف هذا المكان؟",
    piSdkError: "❌ تعذر تحميل Pi SDK.",
    piUserError: "تعذر الحصول على معلومات مستخدم Pi.",
    backendError: "فشل تسجيل الدخول إلى الخادم.",
    loginFailed: "❌ فشل تسجيل الدخول باستخدام Pi.",
    locationChosen: "📍 تم اختيار الموقع. أدخل معلومات المكان.",
    location: "📍 الموقع",
    anonymous: "مستخدم",
  },

  Spanish: {
    appDescription:
      "Descubre tiendas, productos, servicios y negocios impulsados por Pi cerca de ti.",
    signIn: "π Iniciar sesión con Pi",
    connected: "Pi conectado",
    search: "🔎 Buscar lugares, negocios o usuarios...",
    nearby: "📍 Lugares cercanos",
    allPlaces: "🌍 Mostrar todos los lugares",
    locationFound: "📍 Ubicación encontrada",
    nearestFirst: "📏 Los lugares más cercanos aparecen primero",
    all: "Todos",
    stays: "Alojamientos",
    shops: "Tiendas",
    food: "Comida",
    services: "Servicios",
    jobs: "Empleos",
    addPlace: "📍 Añadir lugar",
    language: "Idioma",
    country: "País",
    allLanguages: "🗣️ Todos los idiomas",
    allCountries: "🌍 Todos los países",
    addPlaceTitle: "📍 Añadir lugar",
    tapMap: "Toca el mapa para seleccionar una ubicación.",
    locationSelected: "✅ Ubicación seleccionada",
    placeName: "Nombre del lugar",
    description: "Descripción",
    save: "💾 Guardar",
    cancel: "Cancelar",
    selectedLocation: "📍 Ubicación seleccionada",
    details: "📋 Ver detalles",
    detailsTitle: "Detalles",
    map: "🗺️ Mostrar en el mapa",
    delete: "🗑️ Eliminar lugar",
    close: "Cerrar",
    distance: "km de distancia",
    places: "🌍 Lugares de Pi Economy",
    nearbyPlaces: "📍 Lugares en 50 km — más cercanos primero",
    results: "resultados",
    searchingLocation: "📍 Obteniendo tu ubicación...",
    locationNotSupported: "❌ La ubicación no es compatible.",
    locationDenied: "❌ Permiso de ubicación denegado.",
    signInFirst: "❌ Inicia sesión con Pi primero.",
    deleteLogin: "❌ Debes iniciar sesión con Pi para eliminar.",
    saving: "⏳ Guardando lugar...",
    deleting: "⏳ Eliminando lugar...",
    deleted: "eliminado.",
    saved: "guardado.",
    nameRequired: "❌ Introduce un nombre.",
    descriptionTitle: "DESCRIPCIÓN",
    languageSelector: "🌐 Idioma de la aplicación",
    confirmDelete: "¿Seguro que quieres eliminar este lugar?",
    piSdkError: "❌ No se pudo cargar Pi SDK.",
    piUserError: "No se pudo obtener la información del usuario Pi.",
    backendError: "Error al iniciar sesión en el backend.",
    loginFailed: "❌ Falló el inicio de sesión con Pi.",
    locationChosen:
      "📍 Ubicación seleccionada. Introduce la información.",
    location: "📍 Ubicación",
    anonymous: "Usuario",
  },

  French: {
    appDescription:
      "Découvrez les magasins, produits, services et entreprises propulsés par Pi près de chez vous.",
    signIn: "π Se connecter avec Pi",
    connected: "Pi connecté",
    search: "🔎 Rechercher des lieux, entreprises ou utilisateurs...",
    nearby: "📍 Lieux à proximité",
    allPlaces: "🌍 Afficher tous les lieux",
    locationFound: "📍 Position trouvée",
    nearestFirst: "📏 Les lieux les plus proches en premier",
    all: "Tous",
    stays: "Hébergements",
    shops: "Boutiques",
    food: "Restaurants",
    services: "Services",
    jobs: "Emplois",
    addPlace: "📍 Ajouter un lieu",
    language: "Langue",
    country: "Pays",
    allLanguages: "🗣️ Toutes les langues",
    allCountries: "🌍 Tous les pays",
    addPlaceTitle: "📍 Ajouter un lieu",
    tapMap: "Touchez la carte pour sélectionner un emplacement.",
    locationSelected: "✅ Emplacement sélectionné",
    placeName: "Nom du lieu",
    description: "Description",
    save: "💾 Enregistrer",
    cancel: "Annuler",
    selectedLocation: "📍 Emplacement sélectionné",
    details: "📋 Voir les détails",
    detailsTitle: "Détails",
    map: "🗺️ Afficher sur la carte",
    delete: "🗑️ Supprimer le lieu",
    close: "Fermer",
    distance: "km",
    places: "🌍 Lieux Pi Economy",
    nearbyPlaces:
      "📍 Lieux dans un rayon de 50 km — plus proches en premier",
    results: "résultats",
    searchingLocation: "📍 Obtention de votre position...",
    locationNotSupported:
      "❌ La localisation n'est pas prise en charge.",
    locationDenied: "❌ Autorisation de localisation refusée.",
    signInFirst: "❌ Connectez-vous d'abord avec Pi.",
    deleteLogin:
      "❌ Vous devez être connecté avec Pi pour supprimer.",
    saving: "⏳ Enregistrement...",
    deleting: "⏳ Suppression...",
    deleted: "supprimé.",
    saved: "enregistré.",
    nameRequired: "❌ Entrez le nom du lieu.",
    descriptionTitle: "DESCRIPTION",
    languageSelector: "🌐 Langue de l'application",
    confirmDelete: "Voulez-vous vraiment supprimer ce lieu ?",
    piSdkError: "❌ Pi SDK n'a pas pu être chargé.",
    piUserError:
      "Impossible d'obtenir les informations utilisateur Pi.",
    backendError: "Échec de la connexion au backend.",
    loginFailed: "❌ Échec de la connexion Pi.",
    locationChosen:
      "📍 Emplacement sélectionné. Saisissez les informations.",
    location: "📍 Emplacement",
    anonymous: "Utilisateur",
  },

  German: {
    appDescription:
      "Entdecke Pi-betriebene Geschäfte, Produkte, Dienstleistungen und Unternehmen in deiner Nähe.",
    signIn: "π Mit Pi anmelden",
    connected: "Pi verbunden",
    search: "🔎 Orte, Unternehmen oder Nutzer suchen...",
    nearby: "📍 Orte in der Nähe",
    allPlaces: "🌍 Alle Orte anzeigen",
    locationFound: "📍 Standort gefunden",
    nearestFirst: "📏 Nächste Orte zuerst",
    all: "Alle",
    stays: "Unterkünfte",
    shops: "Geschäfte",
    food: "Essen",
    services: "Dienstleistungen",
    jobs: "Jobs",
    addPlace: "📍 Ort hinzufügen",
    language: "Sprache",
    country: "Land",
    allLanguages: "🗣️ Alle Sprachen",
    allCountries: "🌍 Alle Länder",
    addPlaceTitle: "📍 Ort hinzufügen",
    tapMap: "Tippe auf die Karte, um einen Standort auszuwählen.",
    locationSelected: "✅ Standort ausgewählt",
    placeName: "Name des Ortes",
    description: "Beschreibung",
    save: "💾 Speichern",
    cancel: "Abbrechen",
    selectedLocation: "📍 Ausgewählter Standort",
    details: "📋 Details anzeigen",
    detailsTitle: "Details",
    map: "🗺️ Auf Karte anzeigen",
    delete: "🗑️ Ort löschen",
    close: "Schließen",
    distance: "km entfernt",
    places: "🌍 Pi Economy Orte",
    nearbyPlaces: "📍 Orte innerhalb von 50 km — nächste zuerst",
    results: "Ergebnisse",
    searchingLocation: "📍 Standort wird ermittelt...",
    locationNotSupported: "❌ Standort wird nicht unterstützt.",
    locationDenied: "❌ Standortberechtigung verweigert.",
    signInFirst: "❌ Bitte zuerst mit Pi anmelden.",
    deleteLogin:
      "❌ Zum Löschen musst du mit Pi angemeldet sein.",
    saving: "⏳ Ort wird gespeichert...",
    deleting: "⏳ Ort wird gelöscht...",
    deleted: "gelöscht.",
    saved: "gespeichert.",
    nameRequired: "❌ Bitte einen Namen eingeben.",
    descriptionTitle: "BESCHREIBUNG",
    languageSelector: "🌐 App-Sprache",
    confirmDelete: "Möchtest du diesen Ort wirklich löschen?",
    piSdkError: "❌ Pi SDK konnte nicht geladen werden.",
    piUserError:
      "Pi-Benutzerinformationen konnten nicht abgerufen werden.",
    backendError: "Backend-Anmeldung fehlgeschlagen.",
    loginFailed: "❌ Pi-Anmeldung fehlgeschlagen.",
    locationChosen:
      "📍 Standort ausgewählt. Gib die Informationen ein.",
    location: "📍 Standort",
    anonymous: "Benutzer",
  },

  Portuguese: {
    appDescription:
      "Descubra lojas, produtos, serviços e empresas com tecnologia Pi perto de você.",
    signIn: "π Entrar com Pi",
    connected: "Pi conectado",
    search: "🔎 Pesquisar lugares, empresas ou usuários...",
    nearby: "📍 Lugares próximos",
    allPlaces: "🌍 Mostrar todos os lugares",
    locationFound: "📍 Localização encontrada",
    nearestFirst: "📏 Lugares mais próximos primeiro",
    all: "Todos",
    stays: "Hospedagens",
    shops: "Lojas",
    food: "Comida",
    services: "Serviços",
    jobs: "Empregos",
    addPlace: "📍 Adicionar lugar",
    language: "Idioma",
    country: "País",
    allLanguages: "🗣️ Todos os idiomas",
    allCountries: "🌍 Todos os países",
    addPlaceTitle: "📍 Adicionar lugar",
    tapMap: "Toque no mapa para selecionar um local.",
    locationSelected: "✅ Local selecionado",
    placeName: "Nome do lugar",
    description: "Descrição",
    save: "💾 Salvar",
    cancel: "Cancelar",
    selectedLocation: "📍 Local selecionado",
    details: "📋 Ver detalhes",
    detailsTitle: "Detalhes",
    map: "🗺️ Mostrar no mapa",
    delete: "🗑️ Excluir lugar",
    close: "Fechar",
    distance: "km de distância",
    places: "🌍 Lugares Pi Economy",
    nearbyPlaces:
      "📍 Lugares em até 50 km — mais próximos primeiro",
    results: "resultados",
    searchingLocation: "📍 Obtendo sua localização...",
    locationNotSupported: "❌ Localização não suportada.",
    locationDenied: "❌ Permissão de localização negada.",
    signInFirst: "❌ Entre com Pi primeiro.",
    deleteLogin:
      "❌ Você precisa entrar com Pi para excluir.",
    saving: "⏳ Salvando lugar...",
    deleting: "⏳ Excluindo lugar...",
    deleted: "excluído.",
    saved: "salvo.",
    nameRequired: "❌ Digite o nome do lugar.",
    descriptionTitle: "DESCRIÇÃO",
    languageSelector: "🌐 Idioma do aplicativo",
    confirmDelete:
      "Tem certeza de que deseja excluir este lugar?",
    piSdkError: "❌ Não foi possível carregar o Pi SDK.",
    piUserError:
      "Não foi possível obter os dados do usuário Pi.",
    backendError: "Falha no login do backend.",
    loginFailed: "❌ Falha no login com Pi.",
    locationChosen:
      "📍 Local selecionado. Digite as informações.",
    location: "📍 Localização",
    anonymous: "Usuário",
  },

  Russian: {
    appDescription:
      "Открывайте магазины, товары, услуги и компании на базе Pi рядом с вами.",
    signIn: "π Войти через Pi",
    connected: "Pi подключён",
    search: "🔎 Поиск мест, компаний или пользователей...",
    nearby: "📍 Места рядом",
    allPlaces: "🌍 Показать все места",
    locationFound: "📍 Местоположение найдено",
    nearestFirst: "📏 Сначала ближайшие места",
    all: "Все",
    stays: "Проживание",
    shops: "Магазины",
    food: "Еда",
    services: "Услуги",
    jobs: "Работа",
    addPlace: "📍 Добавить место",
    language: "Язык",
    country: "Страна",
    allLanguages: "🗣️ Все языки",
    allCountries: "🌍 Все страны",
    addPlaceTitle: "📍 Добавить место",
    tapMap: "Нажмите на карту, чтобы выбрать место.",
    locationSelected: "✅ Место выбрано",
    placeName: "Название места",
    description: "Описание",
    save: "💾 Сохранить",
    cancel: "Отмена",
    selectedLocation: "📍 Выбранное место",
    details: "📋 Подробнее",
    detailsTitle: "Подробности",
    map: "🗺️ Показать на карте",
    delete: "🗑️ Удалить место",
    close: "Закрыть",
    distance: "км",
    places: "🌍 Места Pi Economy",
    nearbyPlaces:
      "📍 Места в пределах 50 км — ближайшие первыми",
    results: "результаты",
    searchingLocation: "📍 Определяем местоположение...",
    locationNotSupported: "❌ Геолокация не поддерживается.",
    locationDenied:
      "❌ Доступ к местоположению запрещён.",
    signInFirst: "❌ Сначала войдите через Pi.",
    deleteLogin:
      "❌ Для удаления необходимо войти через Pi.",
    saving: "⏳ Сохранение места...",
    deleting: "⏳ Удаление места...",
    deleted: "удалено.",
    saved: "сохранено.",
    nameRequired: "❌ Введите название места.",
    descriptionTitle: "ОПИСАНИЕ",
    languageSelector: "🌐 Язык приложения",
    confirmDelete:
      "Вы уверены, что хотите удалить это место?",
    piSdkError: "❌ Не удалось загрузить Pi SDK.",
    piUserError:
      "Не удалось получить данные пользователя Pi.",
    backendError: "Ошибка входа через backend.",
    loginFailed: "❌ Ошибка входа через Pi.",
    locationChosen:
      "📍 Место выбрано. Введите информацию.",
    location: "📍 Местоположение",
    anonymous: "Пользователь",
  },

  Chinese: {
    appDescription:
      "发现附近由 Pi 驱动的商店、产品、服务和企业。",
    signIn: "π 使用 Pi 登录",
    connected: "Pi 已连接",
    search: "🔎 搜索地点、商家或用户...",
    nearby: "📍 附近地点",
    allPlaces: "🌍 显示所有地点",
    locationFound: "📍 已找到位置",
    nearestFirst: "📏 优先显示最近的地点",
    all: "全部",
    stays: "住宿",
    shops: "商店",
    food: "餐饮",
    services: "服务",
    jobs: "工作",
    addPlace: "📍 添加地点",
    language: "语言",
    country: "国家",
    allLanguages: "🗣️ 所有语言",
    allCountries: "🌍 所有国家",
    addPlaceTitle: "📍 添加地点",
    tapMap: "点击地图选择位置。",
    locationSelected: "✅ 已选择位置",
    placeName: "地点名称",
    description: "描述",
    save: "💾 保存",
    cancel: "取消",
    selectedLocation: "📍 已选择的位置",
    details: "📋 查看详情",
    detailsTitle: "详情",
    map: "🗺️ 在地图上显示",
    delete: "🗑️ 删除地点",
    close: "关闭",
    distance: "公里",
    places: "🌍 Pi Economy 地点",
    nearbyPlaces:
      "📍 50 公里内的地点 — 最近的优先",
    results: "结果",
    searchingLocation: "📍 正在获取位置...",
    locationNotSupported: "❌ 不支持定位。",
    locationDenied: "❌ 定位权限被拒绝。",
    signInFirst: "❌ 请先使用 Pi 登录。",
    deleteLogin: "❌ 删除前必须使用 Pi 登录。",
    saving: "⏳ 正在保存地点...",
    deleting: "⏳ 正在删除地点...",
    deleted: "已删除。",
    saved: "已保存。",
    nameRequired: "❌ 请输入地点名称。",
    descriptionTitle: "描述",
    languageSelector: "🌐 应用语言",
    confirmDelete: "确定要删除这个地点吗？",
    piSdkError: "❌ Pi SDK 无法加载。",
    piUserError: "无法获取 Pi 用户信息。",
    backendError: "后台登录失败。",
    loginFailed: "❌ Pi 登录失败。",
    locationChosen:
      "📍 已选择位置。请输入地点信息。",
    location: "📍 位置",
    anonymous: "用户",
  },

  Hindi: {
    appDescription:
      "अपने आसपास Pi द्वारा संचालित स्टोर, उत्पाद, सेवाएँ और व्यवसाय खोजें।",
    signIn: "π Pi से साइन इन करें",
    connected: "Pi कनेक्टेड",
    search: "🔎 स्थान, व्यवसाय या उपयोगकर्ता खोजें...",
    nearby: "📍 आस-पास के स्थान",
    allPlaces: "🌍 सभी स्थान दिखाएँ",
    locationFound: "📍 स्थान मिल गया",
    nearestFirst: "📏 सबसे नज़दीकी स्थान पहले",
    all: "सभी",
    stays: "रहने की जगह",
    shops: "दुकानें",
    food: "भोजन",
    services: "सेवाएँ",
    jobs: "नौकरियाँ",
    addPlace: "📍 स्थान जोड़ें",
    language: "भाषा",
    country: "देश",
    allLanguages: "🗣️ सभी भाषाएँ",
    allCountries: "🌍 सभी देश",
    addPlaceTitle: "📍 स्थान जोड़ें",
    tapMap: "स्थान चुनने के लिए मानचित्र पर टैप करें।",
    locationSelected: "✅ स्थान चुना गया",
    placeName: "स्थान का नाम",
    description: "विवरण",
    save: "💾 सहेजें",
    cancel: "रद्द करें",
    selectedLocation: "📍 चयनित स्थान",
    details: "📋 विवरण देखें",
    detailsTitle: "विवरण",
    map: "🗺️ मानचित्र पर दिखाएँ",
    delete: "🗑️ स्थान हटाएँ",
    close: "बंद करें",
    distance: "किमी दूर",
    places: "🌍 Pi Economy स्थान",
    nearbyPlaces:
      "📍 50 किमी के भीतर के स्थान — सबसे नज़दीकी पहले",
    results: "परिणाम",
    searchingLocation:
      "📍 आपका स्थान प्राप्त किया जा रहा है...",
    locationNotSupported:
      "❌ स्थान सुविधा समर्थित नहीं है।",
    locationDenied:
      "❌ स्थान की अनुमति नहीं दी गई।",
    signInFirst: "❌ पहले Pi से साइन इन करें।",
    deleteLogin:
      "❌ हटाने के लिए Pi से साइन इन करना आवश्यक है।",
    saving: "⏳ स्थान सहेजा जा रहा है...",
    deleting: "⏳ स्थान हटाया जा रहा है...",
    deleted: "हटा दिया गया।",
    saved: "सहेजा गया।",
    nameRequired: "❌ स्थान का नाम दर्ज करें।",
    descriptionTitle: "विवरण",
    languageSelector: "🌐 ऐप की भाषा",
    confirmDelete:
      "क्या आप वाकई इस स्थान को हटाना चाहते हैं?",
    piSdkError: "❌ Pi SDK लोड नहीं हो सका।",
    piUserError:
      "Pi उपयोगकर्ता की जानकारी प्राप्त नहीं हो सकी।",
    backendError: "Backend साइन-इन विफल हुआ।",
    loginFailed: "❌ Pi साइन-इन विफल हुआ।",
    locationChosen:
      "📍 स्थान चुना गया। स्थान की जानकारी दर्ज करें।",
    location: "📍 स्थान",
    anonymous: "उपयोगकर्ता",
  },
} as const;

type TranslationKey = keyof typeof translations.Turkish;

type ExtraTranslation = {
  home: string;
  nearby: string;
  add: string;
  favorites: string;
  profile: string;
  share: string;
  removeFavorite: string;
  addFavorite: string;
  showOnMap: string;
  delete: string;
  close: string;
  emptyFavorites: string;
  noPlaces: string;
  viewDetails: string;
  placeImage: string;
  removeImage: string;
  preparingPhoto: string;
  photoAdded: string;
  choosePhoto: string;
  savePlace: string;
  cancel: string;
  location: string;
  category: string;
  language: string;
  country: string;
};

const extraTranslations: Record<AppLanguage, ExtraTranslation> = {
  Turkish: {home:"Ana Sayfa",nearby:"Yakınımda",add:"Yer Ekle",favorites:"Favoriler",profile:"Profil",share:"Paylaş",removeFavorite:"Favorilerden çıkar",addFavorite:"Favorilere ekle",showOnMap:"Haritada Göster",delete:"Yeri Sil",close:"Kapat",emptyFavorites:"Henüz favori eklenmedi.",noPlaces:"Henüz yer bulunamadı.",viewDetails:"Detayları Gör",placeImage:"İşletme Fotoğrafı",removeImage:"Fotoğrafı kaldır",preparingPhoto:"Fotoğraf hazırlanıyor...",photoAdded:"Fotoğraf eklendi.",choosePhoto:"Fotoğraf seç",savePlace:"Yeri Kaydet",cancel:"İptal",location:"Konum",category:"Kategori",language:"Dil",country:"Ülke"},
  English: {home:"Home",nearby:"Nearby",add:"Add Place",favorites:"Favorites",profile:"Profile",share:"Share",removeFavorite:"Remove from favorites",addFavorite:"Add to favorites",showOnMap:"Show on Map",delete:"Delete Place",close:"Close",emptyFavorites:"No favorites yet.",noPlaces:"No places found yet.",viewDetails:"View Details",placeImage:"Place Photo",removeImage:"Remove photo",preparingPhoto:"Preparing photo...",photoAdded:"Photo added.",choosePhoto:"Choose photo",savePlace:"Save Place",cancel:"Cancel",location:"Location",category:"Category",language:"Language",country:"Country"},
  Arabic: {home:"الرئيسية",nearby:"بالقرب مني",add:"إضافة مكان",favorites:"المفضلة",profile:"الملف الشخصي",share:"مشاركة",removeFavorite:"إزالة من المفضلة",addFavorite:"إضافة إلى المفضلة",showOnMap:"عرض على الخريطة",delete:"حذف المكان",close:"إغلاق",emptyFavorites:"لا توجد مفضلات بعد.",noPlaces:"لا توجد أماكن بعد.",viewDetails:"عرض التفاصيل",placeImage:"صورة المكان",removeImage:"إزالة الصورة",preparingPhoto:"جارٍ تجهيز الصورة...",photoAdded:"تمت إضافة الصورة.",choosePhoto:"اختر صورة",savePlace:"حفظ المكان",cancel:"إلغاء",location:"الموقع",category:"الفئة",language:"اللغة",country:"الدولة"},
  Spanish: {home:"Inicio",nearby:"Cerca",add:"Añadir lugar",favorites:"Favoritos",profile:"Perfil",share:"Compartir",removeFavorite:"Quitar de favoritos",addFavorite:"Añadir a favoritos",showOnMap:"Mostrar en el mapa",delete:"Eliminar lugar",close:"Cerrar",emptyFavorites:"Aún no hay favoritos.",noPlaces:"Aún no hay lugares.",viewDetails:"Ver detalles",placeImage:"Foto del lugar",removeImage:"Quitar foto",preparingPhoto:"Preparando foto...",photoAdded:"Foto añadida.",choosePhoto:"Elegir foto",savePlace:"Guardar lugar",cancel:"Cancelar",location:"Ubicación",category:"Categoría",language:"Idioma",country:"País"},
  French: {home:"Accueil",nearby:"À proximité",add:"Ajouter un lieu",favorites:"Favoris",profile:"Profil",share:"Partager",removeFavorite:"Retirer des favoris",addFavorite:"Ajouter aux favoris",showOnMap:"Afficher sur la carte",delete:"Supprimer le lieu",close:"Fermer",emptyFavorites:"Aucun favori pour le moment.",noPlaces:"Aucun lieu pour le moment.",viewDetails:"Voir les détails",placeImage:"Photo du lieu",removeImage:"Supprimer la photo",preparingPhoto:"Préparation de la photo...",photoAdded:"Photo ajoutée.",choosePhoto:"Choisir une photo",savePlace:"Enregistrer",cancel:"Annuler",location:"Emplacement",category:"Catégorie",language:"Langue",country:"Pays"},
  German: {home:"Startseite",nearby:"In der Nähe",add:"Ort hinzufügen",favorites:"Favoriten",profile:"Profil",share:"Teilen",removeFavorite:"Aus Favoriten entfernen",addFavorite:"Zu Favoriten hinzufügen",showOnMap:"Auf Karte anzeigen",delete:"Ort löschen",close:"Schließen",emptyFavorites:"Noch keine Favoriten.",noPlaces:"Noch keine Orte.",viewDetails:"Details anzeigen",placeImage:"Ortsfoto",removeImage:"Foto entfernen",preparingPhoto:"Foto wird vorbereitet...",photoAdded:"Foto hinzugefügt.",choosePhoto:"Foto auswählen",savePlace:"Ort speichern",cancel:"Abbrechen",location:"Standort",category:"Kategorie",language:"Sprache",country:"Land"},
  Portuguese: {home:"Início",nearby:"Perto de mim",add:"Adicionar lugar",favorites:"Favoritos",profile:"Perfil",share:"Compartilhar",removeFavorite:"Remover dos favoritos",addFavorite:"Adicionar aos favoritos",showOnMap:"Mostrar no mapa",delete:"Excluir lugar",close:"Fechar",emptyFavorites:"Ainda não há favoritos.",noPlaces:"Ainda não há lugares.",viewDetails:"Ver detalhes",placeImage:"Foto do lugar",removeImage:"Remover foto",preparingPhoto:"Preparando foto...",photoAdded:"Foto adicionada.",choosePhoto:"Escolher foto",savePlace:"Salvar lugar",cancel:"Cancelar",location:"Localização",category:"Categoria",language:"Idioma",country:"País"},
  Russian: {home:"Главная",nearby:"Рядом",add:"Добавить место",favorites:"Избранное",profile:"Профиль",share:"Поделиться",removeFavorite:"Удалить из избранного",addFavorite:"Добавить в избранное",showOnMap:"Показать на карте",delete:"Удалить место",close:"Закрыть",emptyFavorites:"Избранных мест пока нет.",noPlaces:"Мест пока нет.",viewDetails:"Подробнее",placeImage:"Фото места",removeImage:"Удалить фото",preparingPhoto:"Подготовка фото...",photoAdded:"Фото добавлено.",choosePhoto:"Выбрать фото",savePlace:"Сохранить место",cancel:"Отмена",location:"Местоположение",category:"Категория",language:"Язык",country:"Страна"},
  Chinese: {home:"首页",nearby:"附近",add:"添加地点",favorites:"收藏",profile:"个人资料",share:"分享",removeFavorite:"取消收藏",addFavorite:"加入收藏",showOnMap:"在地图上显示",delete:"删除地点",close:"关闭",emptyFavorites:"暂无收藏。",noPlaces:"暂无地点。",viewDetails:"查看详情",placeImage:"地点照片",removeImage:"删除照片",preparingPhoto:"正在准备照片...",photoAdded:"照片已添加。",choosePhoto:"选择照片",savePlace:"保存地点",cancel:"取消",location:"位置",category:"类别",language:"语言",country:"国家"},
  Hindi: {home:"होम",nearby:"पास में",add:"स्थान जोड़ें",favorites:"पसंदीदा",profile:"प्रोफ़ाइल",share:"साझा करें",removeFavorite:"पसंदीदा से हटाएँ",addFavorite:"पसंदीदा में जोड़ें",showOnMap:"मानचित्र पर दिखाएँ",delete:"स्थान हटाएँ",close:"बंद करें",emptyFavorites:"अभी कोई पसंदीदा नहीं।",noPlaces:"अभी कोई स्थान नहीं।",viewDetails:"विवरण देखें",placeImage:"स्थान की फोटो",removeImage:"फोटो हटाएँ",preparingPhoto:"फोटो तैयार हो रही है...",photoAdded:"फोटो जोड़ दी गई।",choosePhoto:"फोटो चुनें",savePlace:"स्थान सहेजें",cancel:"रद्द करें",location:"स्थान",category:"श्रेणी",language:"भाषा",country:"देश"},
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
];

function PioneerMapPage() {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pioneermap-2.onrender.com";

  /* =======================================================
  APP LANGUAGE
  ======================================================= */

  const [appLanguage, setAppLanguage] =
    useState<AppLanguage>(() => {
      try {
        const saved =
          localStorage.getItem(
            "pioneerMapAppLanguage"
          );

        if (
          saved &&
          [
            "Turkish",
            "English",
            "Arabic",
            "Spanish",
            "French",
            "German",
            "Portuguese",
            "Russian",
            "Chinese",
            "Hindi",
          ].includes(saved)
        ) {
          return saved as AppLanguage;
        }
      } catch {}

      return "Turkish";
    });

  const t = (key: TranslationKey) =>
    translations[appLanguage][key];

  useEffect(() => {
    try {
      localStorage.setItem(
        "pioneerMapAppLanguage",
        appLanguage
      );
    } catch {}

    document.documentElement.lang =
      appLanguage === "Turkish"
        ? "tr"
        : appLanguage === "English"
        ? "en"
        : appLanguage === "Arabic"
        ? "ar"
        : appLanguage === "Spanish"
        ? "es"
        : appLanguage === "French"
        ? "fr"
        : appLanguage === "German"
        ? "de"
        : appLanguage === "Portuguese"
        ? "pt"
        : appLanguage === "Russian"
        ? "ru"
        : appLanguage === "Chinese"
        ? "zh"
        : "hi";

    document.documentElement.dir =
      appLanguage === "Arabic"
        ? "rtl"
        : "ltr";
  }, [appLanguage]);

  /* =======================================================
  STATE
  ======================================================= */

  const [status, setStatus] =
    useState("");

  const [activeNav, setActiveNav] =
    useState<
      "home" |
      "nearby" |
      "add" |
      "favorites" |
      "profile"
    >("home");

  const [signedIn, setSignedIn] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [places, setPlaces] =
    useState<Place[]>(initialPlaces);

  const [favorites, setFavorites] = useState<Place[]>(() => {
    try {
      const saved = localStorage.getItem("pioneerMapFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "pioneerMapFavorites",
        JSON.stringify(favorites)
      );
    } catch {}
  }, [favorites]);

  const getPlaceKey = (place: Place) =>
    place._id ||
    `${place.name}|${place.lat}|${place.lng}`;

  const isFavorite = (place: Place) =>
    favorites.some(
      (favorite) =>
        getPlaceKey(favorite) ===
        getPlaceKey(place)
    );

  const toggleFavorite = (place: Place) => {
    setFavorites((current) => {
      const key = getPlaceKey(place);
      const exists = current.some(
        (favorite) =>
          getPlaceKey(favorite) === key
      );

      if (exists) {
        return current.filter(
          (favorite) =>
            getPlaceKey(favorite) !== key
        );
      }

      return [...current, place];
    });

    setStatus(
      isFavorite(place)
        ? "⭐ Favorilerden çıkarıldı."
        : "⭐ Favorilere eklendi."
    );
  };

  const sharePlace = async (place: Place) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?place=${encodeURIComponent(
      place._id || `${place.name}|${place.lat}|${place.lng}`
    )}`;
    const shareText = `📍 ${place.name} — PioneerMap`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: shareText,
          url: shareUrl,
        });
        setStatus("📤 Yer paylaşım ekranı açıldı.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setStatus("📋 Yer bağlantısı kopyalandı.");
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("📋 Yer bağlantısı kopyalandı.");
      } catch {
        setStatus("❌ Paylaşım bağlantısı kopyalanamadı.");
      }
    }
  };

  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const [activeLanguage, setActiveLanguage] =
    useState("All");

  const [activeCountry, setActiveCountry] =
    useState("All");

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

  const [mapInteractive, setMapInteractive] = useState(false);

  const [placeName, setPlaceName] =
    useState("");

  const [placeDescription, setPlaceDescription] =
    useState("");

  const [placeCategory, setPlaceCategory] =
    useState<
      Exclude<Category, "All">
    >("Stays");

  const [placeLanguage, setPlaceLanguage] =
    useState("Turkish");

  const [placeCountry, setPlaceCountry] =
    useState("Türkiye");

  const [placeImage, setPlaceImage] =
    useState("");

  const [imageUploading, setImageUploading] =
    useState(false);

  const mapRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapInstance =
    useRef<L.Map | null>(null);

  const markersRef =
    useRef<L.Marker[]>([]);

  const userMarkerRef =
    useRef<L.Marker | null>(null);

  /* =======================================================
  PI LOGIN
  ======================================================= */

  const loginWithPi = async () => {
    try {
      const pi = (window as any).Pi;

      if (!pi) {
        setStatus(t("piSdkError"));
        return;
      }

      await pi.init({
        version: "2.0",
        sandbox: false,
      });

      const auth =
        await pi.authenticate(
          ["username"],
          () => true
        );

      if (
        !auth?.user?.username ||
        !auth?.accessToken
      ) {
        throw new Error(
          t("piUserError")
        );
      }

      const response =
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

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            t("backendError")
        );
      }

      setSignedIn(true);
      setUsername(
        auth.user.username
      );

      const welcome =
        appLanguage === "Turkish"
          ? "Hoş geldin"
          : appLanguage === "English"
          ? "Welcome"
          : appLanguage === "Arabic"
          ? "مرحباً"
          : appLanguage === "Spanish"
          ? "Bienvenido"
          : appLanguage === "French"
          ? "Bienvenue"
          : appLanguage === "German"
          ? "Willkommen"
          : appLanguage === "Portuguese"
          ? "Bem-vindo"
          : appLanguage === "Russian"
          ? "Добро пожаловать"
          : appLanguage === "Chinese"
          ? "欢迎"
          : "स्वागत है";

      setStatus(
        `✅ ${welcome} @${auth.user.username}`
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
          : t("loginFailed")
      );
    }
  };

  /* =======================================================
  LOAD PLACES
  ======================================================= */

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response =
          await fetch(
            `${backendUrl}/api/places`,
            {
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

  /* =======================================================
  MAP INITIALIZATION
  ======================================================= */

  useEffect(() => {
    if (
      !mapRef.current ||
      mapInstance.current
    ) {
      return;
    }

    const map = L.map(mapRef.current, {
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    }).setView([39.9334, 32.8597], 6);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "© OpenStreetMap contributors",
      }
    ).addTo(map);

    map.on(
      "click",
      (event) => {
        setSelectedLocation({
          lat: event.latlng.lat,
          lng: event.latlng.lng,
        });

        setShowForm(true);
        setStatus(
          t("locationChosen")
        );
      }
    );

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

    if (mapInteractive) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
    }
  }, [mapInteractive]);

  /* =======================================================
  NEARBY
  ======================================================= */

  const findNearbyPlaces = () => {
    if (!navigator.geolocation) {
      setStatus(
        t("locationNotSupported")
      );
      return;
    }

    setStatus(
      t("searchingLocation")
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
                t("location")
              );
        }

        setStatus(
          t("nearestFirst")
        );
      },
      () => {
        setStatus(
          t("locationDenied")
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

    setStatus(t("allPlaces"));
  };

  /* =======================================================
  DELETE PLACE
  ======================================================= */

  const deletePlace = async (
    place: Place
  ) => {
    if (!place._id) {
      setStatus(
        "❌ Place ID not found."
      );
      return;
    }

    if (!signedIn) {
      setStatus(
        t("deleteLogin")
      );
      return;
    }

    const confirmed =
      window.confirm(
        `"${place.name}" ${t(
          "confirmDelete"
        )}`
      );

    if (!confirmed) return;

    try {
      setStatus(
        t("deleting")
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
            "Place could not be deleted."
        );
      }

      setPlaces(
        (current) =>
          current.filter(
            (item) =>
              item._id !== place._id
          )
      );

      setSelectedPlace(null);

      setStatus(
        `✅ ${place.name} ${t(
          "deleted"
        )}`
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Place could not be deleted."
      );
    }
  };

  /* =======================================================
  MARKERS
  ======================================================= */

  useEffect(() => {
    const map =
      mapInstance.current;

    if (!map) return;

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
          nearbyMatch =
            distanceInKm(
              userLocation.lat,
              userLocation.lng,
              place.lat,
              place.lng
            ) <= 50;
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
      filteredPlaces = [
        ...filteredPlaces,
      ].sort(
        (a, b) =>
          distanceInKm(
            userLocation.lat,
            userLocation.lng,
            a.lat,
            a.lng
          ) -
          distanceInKm(
            userLocation.lat,
            userLocation.lng,
            b.lat,
            b.lng
          )
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

        marker.bindPopup(`
          <div style="
            min-width:230px;
            text-align:center;
            font-family:Arial,sans-serif;
          ">
            <div style="
              font-size:34px;
            ">
              ${category.icon}
            </div>

            <div style="
              font-size:19px;
              font-weight:700;
              margin:6px 0;
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
              ${category.icon}
              ${
                place.category ===
                "Stays"
                  ? t("stays")
                  : place.category ===
                    "Shops"
                  ? t("shops")
                  : place.category ===
                    "Food"
                  ? t("food")
                  : place.category ===
                    "Services"
                  ? t("services")
                  : t("jobs")
              }
            </div>

            ${
              place.language
                ? `
                  <div style="
                    margin-top:7px;
                    font-size:13px;
                  ">
                    🗣️ ${place.language}
                  </div>
                `
                : ""
            }

            ${
              place.country
                ? `
                  <div style="
                    margin-top:5px;
                    font-size:13px;
                  ">
                    🌍 ${place.country}
                  </div>
                `
                : ""
            }

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
              class="pioneer-details-button"
              type="button"
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
              ${t("details")}
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
          (event) => {
            const popupElement =
              event.popup.getElement();

            if (!popupElement)
              return;

            const button =
              popupElement.querySelector(
                ".pioneer-details-button"
              ) as HTMLButtonElement | null;

            if (!button) return;

            L.DomEvent.off(
              button
            );

            L.DomEvent.on(
              button,
              "click",
              (clickEvent) => {
                L.DomEvent.stopPropagation(
                  clickEvent
                );

                setSelectedPlace(
                  place
                );

                map.closePopup();

                setTimeout(() => {
                  document
                    .getElementById(
                      "pioneer-detail-card"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                      block: "start",
                    });
                }, 100);
              }
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
    activeLanguage,
    activeCountry,
    searchText,
    nearbyOnly,
    userLocation,
    appLanguage,
  ]);

  /* =======================================================
  ADD PLACE
  ======================================================= */

  const addPlace = async () => {
    if (!signedIn) {
      setStatus(
        t("signInFirst")
      );
      return;
    }

    if (!placeName.trim()) {
      setStatus(
        t("nameRequired")
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

    const newPlace = {
      name: placeName.trim(),
      category: placeCategory,
      lat: location.lat,
      lng: location.lng,
      description:
        placeDescription.trim() ||
        "Pi Economy place",
      language: placeLanguage,
      country: placeCountry,
      image: placeImage || undefined,
      username:
        username || undefined,
    };

    try {
      setStatus(
        t("saving")
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
            "Place could not be saved."
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
          data.user_id || null,
        language:
          data.language ||
          newPlace.language,
        country:
          data.country ||
          newPlace.country,
        image:
          data.image ||
          newPlace.image,
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

      setPlaceName("");
      setPlaceDescription("");
      setPlaceCategory(
        "Stays"
      );
      setPlaceLanguage(
        "Turkish"
      );
      setPlaceCountry(
        "Türkiye"
      );
      setPlaceImage("");
      setImageUploading(false);
      setSelectedLocation(
        null
      );
      setShowForm(false);

      setStatus(
        `✅ ${savedPlace.name} ${t(
          "saved"
        )}`
      );
    } catch (error) {
      console.error(
        "Add place error:",
        error
      );

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Place could not be saved."
      );
    }
  };

  /* =======================================================
  CATEGORIES
  ======================================================= */

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

  const categoryLabel = (
    category: Category
  ) => {
    if (category === "All")
      return t("all");

    if (
      category === "Stays"
    )
      return t("stays");

    if (
      category === "Shops"
    )
      return t("shops");

    if (
      category === "Food"
    )
      return t("food");

    if (
      category === "Services"
    )
      return t("services");

    return t("jobs");
  };

  /* =======================================================
  UI
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        color: "#222",
        paddingBottom: "90px",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#fff",
          padding: "22px 16px",
          textAlign: "center",
          borderBottom:
            "1px solid #eee",
        }}
      >
        <h1
          style={{
            margin:
              "0 0 10px",
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
          {t(
            "appDescription"
          )}
        </p>

        {/* APP LANGUAGE */}
        <div
          style={{
            maxWidth: "420px",
            margin:
              "0 auto 15px",
            textAlign: "left",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            {t(
              "languageSelector"
            )}
          </label>

          <select
            value={
              appLanguage
            }
            onChange={(e) =>
              setAppLanguage(
                e.target.value as AppLanguage
              )
            }
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              padding: "12px",
              borderRadius: "10px",
              border:
                "1px solid #ccc",
              background: "#fff",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {appLanguages.map(
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
        </div>

        {!signedIn ? (
          <button
            onClick={
              loginWithPi
            }
            style={{
              padding:
                "13px 25px",
              border: "none",
              borderRadius:
                "10px",
              background:
                "#1976D2",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            {t("signIn")}
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
            ✅ {t("connected")} —
            @{username}
          </div>
        )}
<Toast
  message={status}
  onClose={() => setStatus("")}
/>
        
      </header>

      {/* SEARCH */}
      <section
        style={{
          background: "#fff",
          padding: "15px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <input
            value={
              searchText
            }
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
            placeholder={t(
              "search"
            )}
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              padding: "15px",
              borderRadius:
                "30px",
              border:
                "2px solid #ddd",
              fontSize: "16px",
            }}
          />

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
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            {nearbyOnly
              ? t("allPlaces")
              : t("nearby")}
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
                {t(
                  "locationFound"
                )}
                <br />
                {t(
                  "nearestFirst"
                )}
              </div>
            )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        style={{
          background: "#fff",
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
                    : "#fff",
                fontWeight:
                  activeCategory ===
                  category.name
                    ? "700"
                    : "400",
              }}
            >
              {category.icon}{" "}
              {categoryLabel(
                category.name
              )}
            </button>
          )
        )}

        <button
          onClick={() =>
            setShowForm(true)
          }
          style={{
            padding:
              "10px 18px",
            border: "none",
            borderRadius:
              "22px",
            background:
              "#222",
            color: "#fff",
            fontWeight:
              "700",
          }}
        >
          {t("addPlace")}
        </button>
      </section>

      {/* LANGUAGE + COUNTRY */}
      <section
        style={{
          background: "#fff",
          padding:
            "0 15px 15px",
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "10px",
          maxWidth:
            "700px",
          margin: "0 auto",
        }}
      >
        <select
          value={
            activeLanguage
          }
          onChange={(e) =>
            setActiveLanguage(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius:
              "10px",
            border:
              "1px solid #ccc",
            fontSize: "15px",
          }}
        >
          <option value="All">
            {t(
              "allLanguages"
            )}
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
          onChange={(e) =>
            setActiveCountry(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius:
              "10px",
            border:
              "1px solid #ccc",
            fontSize: "15px",
          }}
        >
          <option value="All">
            {t(
              "allCountries"
            )}
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
      </section>

      {/* ADD PLACE FORM */}
      {showForm && (
        <>
          <section
            style={{
              margin: "15px",
              padding: "14px",
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: "8px" }}>{extraTranslations[appLanguage].placeImage}</div>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) {
                  setStatus("t("nameRequired")");
                  return;
                }
                if (file.size > 10 * 1024 * 1024) {
                  setStatus("❌ Fotoğraf en fazla 10 MB olabilir.");
                  return;
                }
                try {
                  setImageUploading(true);
                  const compressed = await compressPlaceImage(file);
                  setPlaceImage(compressed);
                  setStatus("{extraTranslations[appLanguage].photoAdded}");
                } catch (error) {
                  console.error("Photo error:", error);
                  setStatus("t("backendError")");
                } finally {
                  setImageUploading(false);
                }
              }}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            {imageUploading && <div style={{ marginTop: "8px", fontWeight: 700 }}>{extraTranslations[appLanguage].preparingPhoto}</div>}
            {placeImage && (
              <div style={{ marginTop: "12px" }}>
                <img
                  src={placeImage}
                  alt="İşletme önizleme"
                  style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "10px", display: "block" }}
                />
                <button
                  type="button"
                  onClick={() => setPlaceImage("")}
                  style={{ marginTop: "8px", padding: "8px 12px", border: "none", borderRadius: "8px", background: "#eee", cursor: "pointer", fontWeight: 700 }}
                >
                  {extraTranslations[appLanguage].removeImage}
                </button>
              </div>
            )}
          </section>

          <AddPlaceForm
          placeName={placeName}
          setPlaceName={setPlaceName}
          placeDescription={placeDescription}
          setPlaceDescription={setPlaceDescription}
          placeCategory={placeCategory}
          setPlaceCategory={(value) => {
            if (
              value === "Stays" ||
              value === "Shops" ||
              value === "Food" ||
              value === "Services" ||
              value === "Jobs"
            ) {
              setPlaceCategory(value);
            }
          }}
          placeLanguage={placeLanguage}
          setPlaceLanguage={setPlaceLanguage}
          placeCountry={placeCountry}
          setPlaceCountry={setPlaceCountry}
          categories={["Stays", "Shops", "Food", "Services", "Jobs"]}
          languages={languages.map((item) => item.value)}
          countries={countries.map((item) => item.value)}
          selectedLocation={selectedLocation}
          onMapSelect={() => setMapInteractive(true)}
          onSubmit={addPlace}
          onCancel={() => {
            setShowForm(false);
            setSelectedLocation(null);
            setPlaceImage("");
          }}
          submitting={imageUploading}
        />
        </>
      )}

      {/* MAP + DETAILS */}
      <main
        style={{
          padding: "15px",
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMapInteractive((current) => !current)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1000,
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#fff",
              color: "#222",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            MAP {mapInteractive ? "ON" : "OFF"}
          </button>
          <div
            ref={mapRef}
            style={{
              width: "100%",
              height: "350px",
            borderRadius:
              "14px",
            overflow:
              "hidden",
            background:
              "#ddd",
            }}
          />
          {!mapInteractive && (
            <div style={{
              position: "absolute",
              left: "50%",
              bottom: "12px",
              transform: "translateX(-50%)",
              zIndex: 1000,
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,.94)",
              fontWeight: 700,
              fontSize: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,.18)",
              pointerEvents: "none",
            }}>
              MAP OFF — Haritayı etkinleştir
            </div>
          )}
        </div>

        {selectedPlace && (
          <PlaceDetails
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onShowOnMap={(place) => {
              const map = mapInstance.current;
              if (map) {
                map.setView(
                  [Number((place as any).lat), Number((place as any).lng)],
                  15
                );
                setMapInteractive(true);
              }
            }}
            onDelete={(place) => deletePlace(place)}
            isFavorite={isFavorite(selectedPlace)}
            onToggleFavorite={(place) => toggleFavorite(place as Place)}
            onShare={(place) => sharePlace(place as Place)}
          />
        )}

        <section style={{ marginTop: "16px" }}>
          <PlaceList
            places={places}
            categoryIcons={{
              Stays: "🏠",
              Shops: "🛍️",
              Food: "🍔",
              Services: "🔧",
              Jobs: "💼",
            }}
            onSelect={(place) => {
              setSelectedPlace(places.find((item) => item._id === place._id) || null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={(place) => {
              const found = places.find((item) => item._id === place._id);
              if (found) deletePlace(found);
            }}
          />
        </section>

        {/* BOTTOM STATUS */}
        <div
          style={{
            textAlign:
              "center",
            fontWeight:
              "700",
            padding:
              "15px 5px 20px",
          }}
        >
          {nearbyOnly &&
          userLocation
            ? t(
                "nearbyPlaces"
              )
            : searchText.trim()
            ? `🔎 "${searchText}" ${t(
                "results"
              )}`
            : activeLanguage !==
              "All"
            ? `🗣️ ${activeLanguage}`
            : activeCountry !==
              "All"
            ? `🌍 ${activeCountry}`
            : activeCategory ===
              "All"
            ? t("places")
            : `${
                categoryIcons[
                  activeCategory
                ].icon
              } ${categoryLabel(
                activeCategory
              )}`}
        </div>
      </main>

      {activeNav === "favorites" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: "82px",
            zIndex: 9000,
            overflowY: "auto",
            background: "#f5f7fa",
            paddingTop: "15px",
          }}
        >
          <Favorites
            favorites={favorites}
            onRemove={(id) => {
              setFavorites((current) =>
                current.filter((place) => place._id !== id)
              );
            }}
            onPlaceClick={(place) => {
              const found = places.find(
                (item) => item._id === place._id
              );

              if (found) {
                setSelectedPlace(found);
                setActiveNav("home");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
          />
        </div>
      )}

      {/* =====================================================
      BOTTOM NAVIGATION
      ===================================================== */}

      <nav
        style={{
          position:
            "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background:
            "#ffffff",
          borderTop:
            "1px solid #ddd",
          boxShadow:
            "0 -4px 18px rgba(0,0,0,.15)",
          display:
            "grid",
          gridTemplateColumns:
            "repeat(5,1fr)",
          padding:
            "8px 4px",
          paddingBottom:
            "calc(8px + env(safe-area-inset-bottom))",
        }}
      >
        {[
          [
            "🏠",
            extraTranslations[appLanguage].home,
            "home",
          ],
          [
            "📍",
            extraTranslations[appLanguage].nearby,
            "nearby",
          ],
          [
            "➕",
            extraTranslations[appLanguage].add,
            "add",
          ],
          [
            "⭐",
            extraTranslations[appLanguage].favorites,
            "favorites",
          ],
          [
            "👤",
            extraTranslations[appLanguage].profile,
            "profile",
          ],
        ].map(
          ([icon, label, key]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveNav(
                  key as
                    | "home"
                    | "nearby"
                    | "add"
                    | "favorites"
                    | "profile"
                );

                if (
                  key === "home"
                ) {
                  setNearbyOnly(
                    false
                  );
                  setUserLocation(
                    null
                  );
                  setSelectedPlace(
                    null
                  );
                  setStatus("");

                  window.scrollTo(
                    {
                      top: 0,
                      behavior:
                        "smooth",
                    }
                  );
                }

                if (
                  key ===
                  "nearby"
                ) {
                  findNearbyPlaces();

                  window.scrollTo(
                    {
                      top: 0,
                      behavior:
                        "smooth",
                    }
                  );
                }

                if (
                  key === "add"
                ) {
                  setShowForm(
                    true
                  );
                  setStatus("");

                  window.scrollTo(
                    {
                      top: 0,
                      behavior:
                        "smooth",
                    }
                  );
                }

                if (
                  key ===
                  "favorites"
                ) {
                  setStatus("");
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }

                if (
                  key ===
                  "profile"
                ) {
                  setStatus(
                    signedIn
                      ? `👤 @${username}`
                      : t("signInFirst")
                  );
                }
              }}
              style={{
                border:
                  "none",
                borderRadius:
                  "12px",
                background:
                  activeNav ===
                  key
                    ? "#e3f2fd"
                    : "transparent",
                color:
                  activeNav ===
                  key
                    ? "#1976D2"
                    : "#333",
                padding:
                  "7px 2px",
                fontWeight:
                  "700",
                fontSize:
                  "11px",
                cursor:
                  "pointer",
              }}
            >
              <div
                style={{
                  fontSize:
                    "23px",
                  lineHeight:
                    "25px",
                }}
              >
                {icon}
              </div>

              <div>
                {label}
              </div>
            </button>
          )
        )}
      </nav>
    </div>
  );
}

export default PioneerMapPage;
