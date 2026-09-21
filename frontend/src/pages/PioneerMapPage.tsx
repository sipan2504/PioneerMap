import { useEffect, useRef, useState } from "react";
import L from "leaflet";
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
    results: "sonuç",
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
    piUserError: "Pi kullanıcı bilgileri alınamadı.",
    backendError: "Sunucu giriş işlemi başarısız.",
    loginFailed: "❌ Pi ile giriş başarısız.",
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
type ExtraTranslation = {
  addPlace?: string;
  home:string; nearby:string; add:string; favorites:string; profile:string; share:string; removeFavorite:string; addFavorite:string; showOnMap:string; delete:string; close:string; emptyFavorites:string; noPlaces:string; viewDetails:string; placeImage:string; removeImage:string; preparingPhoto:string; photoAdded:string; choosePhoto:string; savePlace:string; cancel:string; location:string; category:string; language:string; country:string; photoTooLarge:string;
};
const extraTranslations: Record<AppLanguage, ExtraTranslation> = {
  Turkish:{home:"Ana Sayfa",nearby:"Yakınımdakiler",add:"Yer Ekle",favorites:"Favoriler",profile:"Profil",share:"Paylaş",removeFavorite:"Favorilerden Çıkar",addFavorite:"Favorilere Ekle",showOnMap:"Haritada Göster",delete:"Yeri Sil",close:"Kapat",emptyFavorites:"Henüz favori eklenmedi.",noPlaces:"Henüz yer bulunamadı.",viewDetails:"Detayları Gör",placeImage:"İşletme Fotoğrafı",removeImage:"Fotoğrafı kaldır",preparingPhoto:"Fotoğraf hazırlanıyor...",photoAdded:"Fotoğraf eklendi.",choosePhoto:"Fotoğraf seç",savePlace:"Yeri Kaydet",cancel:"İptal",location:"Konum",category:"Kategori",language:"Dil",country:"Ülke",photoTooLarge:"Fotoğraf en fazla 10 MB olabilir."},
  English:{home:"Home",nearby:"Nearby",add:"Add Place",favorites:"Favorites",profile:"Profile",share:"Share",removeFavorite:"Remove from favorites",addFavorite:"Add to favorites",showOnMap:"Show on Map",delete:"Delete Place",close:"Close",emptyFavorites:"No favorites yet.",noPlaces:"No places found yet.",viewDetails:"View Details",placeImage:"Place Photo",removeImage:"Remove photo",preparingPhoto:"Preparing photo...",photoAdded:"Photo added.",choosePhoto:"Choose photo",savePlace:"Save Place",cancel:"Cancel",location:"Location",category:"Category",language:"Language",country:"Country",photoTooLarge:"Photo must be 10 MB or less."},
  Arabic:{home:"الرئيسية",nearby:"بالقرب مني",add:"إضافة مكان",favorites:"المفضلة",profile:"الملف الشخصي",share:"مشاركة",removeFavorite:"إزالة من المفضلة",addFavorite:"إضافة إلى المفضلة",showOnMap:"عرض على الخريطة",delete:"حذف المكان",close:"إغلاق",emptyFavorites:"لا توجد مفضلات بعد.",noPlaces:"لا توجد أماكن بعد.",viewDetails:"عرض التفاصيل",placeImage:"صورة المكان",removeImage:"إزالة الصورة",preparingPhoto:"جارٍ تجهيز الصورة...",photoAdded:"تمت إضافة الصورة.",choosePhoto:"اختر صورة",savePlace:"حفظ المكان",cancel:"إلغاء",location:"الموقع",category:"الفئة",language:"اللغة",country:"الدولة",photoTooLarge:"يجب ألا تتجاوز الصورة 10 ميغابايت."},
  Spanish:{home:"Inicio",nearby:"Cerca",add:"Añadir lugar",favorites:"Favoritos",profile:"Perfil",share:"Compartir",removeFavorite:"Quitar de favoritos",addFavorite:"Añadir a favoritos",showOnMap:"Mostrar en el mapa",delete:"Eliminar lugar",close:"Cerrar",emptyFavorites:"Aún no hay favoritos.",noPlaces:"Aún no hay lugares.",viewDetails:"Ver detalles",placeImage:"Foto del lugar",removeImage:"Quitar foto",preparingPhoto:"Preparando foto...",photoAdded:"Foto añadida.",choosePhoto:"Elegir foto",savePlace:"Guardar lugar",cancel:"Cancelar",location:"Ubicación",category:"Categoría",language:"Idioma",country:"País",photoTooLarge:"A foto deve ter no máximo 10 MB."},
  French:{home:"Accueil",nearby:"À proximité",add:"Ajouter un lieu",favorites:"Favoris",profile:"Profil",share:"Partager",removeFavorite:"Retirer des favoris",addFavorite:"Ajouter aux favoris",showOnMap:"Afficher sur la carte",delete:"Supprimer le lieu",close:"Fermer",emptyFavorites:"Aucun favori pour le moment.",noPlaces:"Aucun lieu pour le moment.",viewDetails:"Voir les détails",placeImage:"Photo du lieu",removeImage:"Supprimer la photo",preparingPhoto:"Préparation de la photo...",photoAdded:"Photo ajoutée.",choosePhoto:"Choisir une photo",savePlace:"Enregistrer",cancel:"Annuler",location:"Emplacement",category:"Catégorie",language:"Langue",country:"Pays",photoTooLarge:"La photo doit faire 10 Mo ou moins."},
  German:{home:"Startseite",nearby:"In der Nähe",add:"Ort hinzufügen",favorites:"Favoriten",profile:"Profil",share:"Teilen",removeFavorite:"Aus Favoriten entfernen",addFavorite:"Zu Favoriten hinzufügen",showOnMap:"Auf Karte anzeigen",delete:"Ort löschen",close:"Schließen",emptyFavorites:"Noch keine Favoriten.",noPlaces:"Noch keine Orte.",viewDetails:"Details anzeigen",placeImage:"Ortsfoto",removeImage:"Foto entfernen",preparingPhoto:"Foto wird vorbereitet...",photoAdded:"Foto hinzugefügt.",choosePhoto:"Foto auswählen",savePlace:"Ort speichern",cancel:"Abbrechen",location:"Standort",category:"Kategorie",language:"Sprache",country:"Land",photoTooLarge:"Das Foto darf höchstens 10 MB groß sein."},
  Portuguese:{home:"Início",nearby:"Perto de mim",add:"Adicionar lugar",favorites:"Favoritos",profile:"Perfil",share:"Compartilhar",removeFavorite:"Remover dos favoritos",addFavorite:"Adicionar aos favoritos",showOnMap:"Mostrar no mapa",delete:"Excluir lugar",close:"Fechar",emptyFavorites:"Ainda não há favoritos.",noPlaces:"Ainda não há lugares.",viewDetails:"Ver detalhes",placeImage:"Foto do lugar",removeImage:"Remover foto",preparingPhoto:"Preparando foto...",photoAdded:"Foto adicionada.",choosePhoto:"Escolher foto",savePlace:"Salvar lugar",cancel:"Cancelar",location:"Localização",category:"Categoria",language:"Idioma",country:"País",photoTooLarge:"A foto deve ter no máximo 10 MB."},
  Russian:{home:"Главная",nearby:"Рядом",add:"Добавить место",favorites:"Избранное",profile:"Профиль",share:"Поделиться",removeFavorite:"Удалить из избранного",addFavorite:"Добавить в избранное",showOnMap:"Показать на карте",delete:"Удалить место",close:"Закрыть",emptyFavorites:"Избранных мест пока нет.",noPlaces:"Мест пока нет.",viewDetails:"Подробнее",placeImage:"Фото места",removeImage:"Удалить фото",preparingPhoto:"Подготовка фото...",photoAdded:"Фото добавлено.",choosePhoto:"Выбрать фото",savePlace:"Сохранить место",cancel:"Отмена",location:"Местоположение",category:"Категория",language:"Язык",country:"Страна",photoTooLarge:"Фото должно быть не более 10 МБ."},
  Chinese:{home:"首页",nearby:"附近",add:"添加地点",favorites:"收藏",profile:"个人资料",share:"分享",removeFavorite:"取消收藏",addFavorite:"加入收藏",showOnMap:"在地图上显示",delete:"删除地点",close:"关闭",emptyFavorites:"暂无收藏。",noPlaces:"暂无地点。",viewDetails:"查看详情",placeImage:"地点照片",removeImage:"删除照片",preparingPhoto:"正在准备照片...",photoAdded:"照片已添加。",choosePhoto:"选择照片",savePlace:"保存地点",cancel:"取消",location:"位置",category:"类别",language:"语言",country:"国家",photoTooLarge:"照片大小必须不超过 10 MB。"},
  Hindi:{home:"होम",nearby:"पास में",add:"स्थान जोड़ें",favorites:"पसंदीदा",profile:"प्रोफ़ाइल",share:"साझा करें",removeFavorite:"पसंदीदा से हटाएँ",addFavorite:"पसंदीदा में जोड़ें",showOnMap:"मानचित्र पर दिखाएँ",delete:"स्थान हटाएँ",close:"बंद करें",emptyFavorites:"अभी कोई पसंदीदा नहीं।",noPlaces:"अभी कोई स्थान नहीं।",viewDetails:"विवरण देखें",placeImage:"स्थान की फोटो",removeImage:"फोटो हटाएँ",preparingPhoto:"फोटो तैयार हो रही है...",photoAdded:"फोटो जोड़ दी गई।",choosePhoto:"फोटो चुनें",savePlace:"स्थान सहेजें",cancel:"रद्द करें",location:"स्थान",category:"श्रेणी",language:"भाषा",country:"देश",photoTooLarge:"फ़ोटो 10 MB या उससे कम होनी चाहिए।"},
};


type TranslationKey = keyof typeof translations.Turkish;

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
  {
    name: "Pi Services",
    category: "Services",
    lat: 39.928,
    lng: 32.862,
    description: "Pi-powered local services",
    language: "Turkish",
    country: "Türkiye",
  },
  {
    name: "Pi Jobs",
    category: "Jobs",
    lat: 39.936,
    lng: 32.846,
    description: "Pi-powered job opportunities",
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

  const [mapInteractive, setMapInteractive] = useState<boolean>(true);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [newsIndex, setNewsIndex] = useState(0);

  const piNewsByLanguage: Record<AppLanguage, Array<{title:string; summary:string; date:string; url:string}>> = {
    Turkish: [
      {title:"KYC ve Mainnet geçişinde yeni güncellemeler",summary:"Pi Network, bazı KYC ve migration engellerini çözmek için teknik iyileştirmeler yayımladı.",date:"17 Sep 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Pi Desktop 0.6.3 ve SoloHost güncellemeleri",summary:"Uygulama keşfi, güvenilirlik ve geliştirici araçlarında iyileştirmeler duyuruldu.",date:"9 Sep 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Pi geliştiricileri için yeni yetenekler",summary:"Yerel depolama, staking verilerine erişim ve dosya/video paylaşımı için yeni araçlar geldi.",date:"4 Sep 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    English: [
      {title:"KYC & Mainnet migration updates",summary:"Pi Network released technical updates addressing additional KYC and migration corner cases.",date:"Sep 17, 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Pi Desktop 0.6.3 & SoloHost updates",summary:"New improvements focus on app discovery, reliability, and developer tools.",date:"Sep 9, 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"New capabilities for Pi developers",summary:"Pi introduced local storage, staking data access, and file and video sharing capabilities.",date:"Sep 4, 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    Arabic: [
      {title:"تحديثات KYC وانتقال Mainnet",summary:"أصدرت Pi Network تحديثات تقنية لمعالجة حالات إضافية تعيق KYC والانتقال.",date:"17 سبتمبر 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"تحديثات Pi Desktop 0.6.3 وSoloHost",summary:"تحسينات جديدة لاكتشاف التطبيقات والموثوقية وأدوات المطورين.",date:"9 سبتمبر 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"قدرات جديدة لمطوري Pi",summary:"قدرات جديدة للتخزين المحلي وبيانات التخزين ومشاركة الملفات والفيديو.",date:"4 سبتمبر 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    Spanish: [
      {title:"Actualizaciones de KYC y migración a Mainnet",summary:"Pi Network publicó mejoras técnicas para resolver casos adicionales de KYC y migración.",date:"17 sep 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Actualizaciones de Pi Desktop 0.6.3 y SoloHost",summary:"Mejoras para descubrir aplicaciones, fiabilidad y herramientas para desarrolladores.",date:"9 sep 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Nuevas capacidades para desarrolladores de Pi",summary:"Nuevas funciones de almacenamiento local, staking y uso compartido de archivos y vídeo.",date:"4 sep 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    French: [
      {title:"Mises à jour KYC et migration Mainnet",summary:"Pi Network a publié des améliorations techniques pour certains cas KYC et de migration.",date:"17 sept. 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Mises à jour Pi Desktop 0.6.3 et SoloHost",summary:"Des améliorations concernent la découverte des apps, la fiabilité et les outils développeur.",date:"9 sept. 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Nouvelles capacités pour les développeurs Pi",summary:"De nouvelles fonctions de stockage local et de partage de fichiers et vidéos sont disponibles.",date:"4 sept. 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    German: [
      {title:"Updates zu KYC und Mainnet-Migration",summary:"Pi Network veröffentlichte technische Verbesserungen für weitere KYC- und Migrationsfälle.",date:"17. Sept. 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Pi Desktop 0.6.3 und SoloHost Updates",summary:"Neue Verbesserungen für App-Entdeckung, Zuverlässigkeit und Entwickler-Tools.",date:"9. Sept. 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Neue Funktionen für Pi-Entwickler",summary:"Neue Möglichkeiten für lokalen Speicher, Staking-Daten sowie Datei- und Videofreigabe.",date:"4. Sept. 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    Portuguese: [
      {title:"Atualizações de KYC e migração para Mainnet",summary:"A Pi Network lançou melhorias técnicas para casos adicionais de KYC e migração.",date:"17 set. 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Atualizações do Pi Desktop 0.6.3 e SoloHost",summary:"Novas melhorias em descoberta de apps, confiabilidade e ferramentas para desenvolvedores.",date:"9 set. 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Novos recursos para desenvolvedores Pi",summary:"Novos recursos de armazenamento local e compartilhamento de arquivos e vídeos.",date:"4 set. 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    Russian: [
      {title:"Обновления KYC и миграции в Mainnet",summary:"Pi Network выпустила технические улучшения для дополнительных случаев KYC и миграции.",date:"17 сент. 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Обновления Pi Desktop 0.6.3 и SoloHost",summary:"Улучшения касаются поиска приложений, надежности и инструментов разработчика.",date:"9 сент. 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Новые возможности для разработчиков Pi",summary:"Добавлены локальное хранилище, доступ к данным staking и обмен файлами и видео.",date:"4 сент. 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    Chinese: [
      {title:"KYC 与 Mainnet 迁移更新",summary:"Pi Network 发布了针对更多 KYC 和迁移问题的技术改进。",date:"2026年9月17日",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Pi Desktop 0.6.3 与 SoloHost 更新",summary:"新版本改进了应用发现、可靠性和开发者工具。",date:"2026年9月9日",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Pi 开发者的新能力",summary:"新增本地存储、staking 数据访问以及文件和视频分享能力。",date:"2026年9月4日",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
    Hindi: [
      {title:"KYC और Mainnet माइग्रेशन अपडेट",summary:"Pi Network ने अतिरिक्त KYC और माइग्रेशन मामलों के लिए तकनीकी सुधार जारी किए।",date:"17 सितम्बर 2026",url:"https://minepi.com/blog/kyc-mainnet-migration-9-26/"},
      {title:"Pi Desktop 0.6.3 और SoloHost अपडेट",summary:"ऐप खोज, विश्वसनीयता और डेवलपर टूल्स में नए सुधार।",date:"9 सितम्बर 2026",url:"https://minepi.com/blog/solohost-pi-desktop-0-6-3/"},
      {title:"Pi डेवलपर्स के लिए नई क्षमताएँ",summary:"लोकल स्टोरेज, staking डेटा और फ़ाइल व वीडियो शेयरिंग की नई सुविधाएँ।",date:"4 सितम्बर 2026",url:"https://minepi.com/blog/dev-capabilities-documentation/"},
    ],
  };

  const piNews = piNewsByLanguage[appLanguage];
  const activeNews = piNews[newsIndex % piNews.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNewsIndex((value) => value + 1);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const t = (key: TranslationKey) =>
    translations[appLanguage][key];

  const mapInteractiveRef = useRef(mapInteractive);
  useEffect(() => {
    mapInteractiveRef.current = mapInteractive;
  }, [mapInteractive]);

  /* =======================================================
     GLOBAL UI LANGUAGE BRIDGE
     Some legacy child components still contain fixed Turkish
     labels. This bridge translates only exact UI strings so the
     selected app language applies across the whole visible app.
  ======================================================= */
  useEffect(() => {
    const placeTitle: Record<AppLanguage, string> = {
      Turkish: "Yerler",
      English: "Places",
      Arabic: "الأماكن",
      Spanish: "Lugares",
      French: "Lieux",
      German: "Orte",
      Portuguese: "Lugares",
      Russian: "Места",
      Chinese: "地点",
      Hindi: "स्थान",
    };

    const map: Record<AppLanguage, Record<string, string>> = {
      Turkish: {
        "Yerler": "Yerler",
        "sonuç": "sonuç",
        "⭐ Favorilere Ekle": "⭐ Favorilere Ekle",
        "⭐ Favorilerden Çıkar": "⭐ Favorilerden Çıkar",
        "📤 Yeri Paylaş": "📤 Yeri Paylaş",
        "🗺️ Haritada Göster": "🗺️ Haritada Göster",
        "🗑️ Sil": "🗑️ Sil",
        "Dil:": "Dil:",
        "Ülke:": "Ülke:",
        "👤 Ekleyen:": "👤 Ekleyen:",
        "⭐ Favoriler": "⭐ Favoriler",
        "⭐ Henüz favori eklenmedi.": "⭐ Henüz favori eklenmedi.",
        "📍 Gör": "📍 Gör",
        "Ana Sayfa": "Ana Sayfa",
        "Yakınımda": "Yakınımdakiler",
        "Yer Ekle": "Yer Ekle",
        "Favoriler": "Favoriler",
        "Profil": "Profil",
      },
      English: {
        "Yerler": placeTitle.English,
        "sonuç": "results",
        "📍 Gör": `📍 ${extraTranslations.English.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.English.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.English.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.English.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.English.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.English.delete}`,
        "Dil:": "Language:",
        "Ülke:": "Country:",
        "👤 Ekleyen:": "👤 Added by:",
        "⭐ Favoriler": "⭐ Favorites",
        "⭐ Henüz favori eklenmedi.": "⭐ No favorites yet.",
        "Ana Sayfa": extraTranslations.English.home,
        "Yakınımda": extraTranslations.English.nearby,
        "Yer Ekle": extraTranslations.English.add,
        "Favoriler": extraTranslations.English.favorites,
        "Profil": extraTranslations.English.profile,
      },
      Arabic: {
        "Yerler": placeTitle.Arabic,
        "sonuç": "نتيجة",
        "📍 Gör": `📍 ${extraTranslations.Arabic.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.Arabic.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.Arabic.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.Arabic.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.Arabic.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.Arabic.delete}`,
        "Dil:": "اللغة:",
        "Ülke:": "الدولة:",
        "👤 Ekleyen:": "👤 أضافه:",
        "⭐ Favoriler": "⭐ المفضلة",
        "⭐ Henüz favori eklenmedi.": "⭐ لا توجد مفضلات بعد.",
        "Ana Sayfa": extraTranslations.Arabic.home,
        "Yakınımda": extraTranslations.Arabic.nearby,
        "Yer Ekle": extraTranslations.Arabic.add,
        "Favoriler": extraTranslations.Arabic.favorites,
        "Profil": extraTranslations.Arabic.profile,
      },
      Spanish: {
        "Yerler": placeTitle.Spanish,
        "sonuç": "resultados",
        "📍 Gör": `📍 ${extraTranslations.Spanish.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.Spanish.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.Spanish.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.Spanish.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.Spanish.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.Spanish.delete}`,
        "Dil:": "Idioma:",
        "Ülke:": "País:",
        "👤 Ekleyen:": "👤 Añadido por:",
        "⭐ Favoriler": "⭐ Favoritos",
        "⭐ Henüz favori eklenmedi.": "⭐ Aún no hay favoritos.",
        "Ana Sayfa": extraTranslations.Spanish.home,
        "Yakınımda": extraTranslations.Spanish.nearby,
        "Yer Ekle": extraTranslations.Spanish.add,
        "Favoriler": extraTranslations.Spanish.favorites,
        "Profil": extraTranslations.Spanish.profile,
      },
      French: {
        "Yerler": placeTitle.French,
        "sonuç": "résultats",
        "📍 Gör": `📍 ${extraTranslations.French.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.French.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.French.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.French.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.French.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.French.delete}`,
        "Dil:": "Langue:",
        "Ülke:": "Pays:",
        "👤 Ekleyen:": "👤 Ajouté par:",
        "⭐ Favoriler": "⭐ Favoris",
        "⭐ Henüz favori eklenmedi.": "⭐ Aucun favori pour le moment.",
        "Ana Sayfa": extraTranslations.French.home,
        "Yakınımda": extraTranslations.French.nearby,
        "Yer Ekle": extraTranslations.French.add,
        "Favoriler": extraTranslations.French.favorites,
        "Profil": extraTranslations.French.profile,
      },
      German: {
        "Yerler": placeTitle.German,
        "sonuç": "Ergebnisse",
        "📍 Gör": `📍 ${extraTranslations.German.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.German.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.German.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.German.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.German.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.German.delete}`,
        "Dil:": "Sprache:",
        "Ülke:": "Land:",
        "👤 Ekleyen:": "👤 Hinzugefügt von:",
        "⭐ Favoriler": "⭐ Favoriten",
        "⭐ Henüz favori eklenmedi.": "⭐ Noch keine Favoriten.",
        "Ana Sayfa": extraTranslations.German.home,
        "Yakınımda": extraTranslations.German.nearby,
        "Yer Ekle": extraTranslations.German.add,
        "Favoriler": extraTranslations.German.favorites,
        "Profil": extraTranslations.German.profile,
      },
      Portuguese: {
        "Yerler": placeTitle.Portuguese,
        "sonuç": "resultados",
        "📍 Gör": `📍 ${extraTranslations.Portuguese.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.Portuguese.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.Portuguese.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.Portuguese.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.Portuguese.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.Portuguese.delete}`,
        "Dil:": "Idioma:",
        "Ülke:": "País:",
        "👤 Ekleyen:": "👤 Adicionado por:",
        "⭐ Favoriler": "⭐ Favoritos",
        "⭐ Henüz favori eklenmedi.": "⭐ Ainda não há favoritos.",
        "Ana Sayfa": extraTranslations.Portuguese.home,
        "Yakınımda": extraTranslations.Portuguese.nearby,
        "Yer Ekle": extraTranslations.Portuguese.add,
        "Favoriler": extraTranslations.Portuguese.favorites,
        "Profil": extraTranslations.Portuguese.profile,
      },
      Russian: {
        "Yerler": placeTitle.Russian,
        "sonuç": "результатов",
        "📍 Gör": `📍 ${extraTranslations.Russian.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.Russian.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.Russian.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.Russian.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.Russian.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.Russian.delete}`,
        "Dil:": "Язык:",
        "Ülke:": "Страна:",
        "👤 Ekleyen:": "👤 Добавил:",
        "⭐ Favoriler": "⭐ Избранное",
        "⭐ Henüz favori eklenmedi.": "⭐ Избранных мест пока нет.",
        "Ana Sayfa": extraTranslations.Russian.home,
        "Yakınımda": extraTranslations.Russian.nearby,
        "Yer Ekle": extraTranslations.Russian.add,
        "Favoriler": extraTranslations.Russian.favorites,
        "Profil": extraTranslations.Russian.profile,
      },
      Chinese: {
        "Yerler": placeTitle.Chinese,
        "sonuç": "个结果",
        "📍 Gör": `📍 ${extraTranslations.Chinese.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.Chinese.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.Chinese.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.Chinese.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.Chinese.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.Chinese.delete}`,
        "Dil:": "语言:",
        "Ülke:": "国家:",
        "👤 Ekleyen:": "👤 添加者:",
        "⭐ Favoriler": "⭐ 收藏",
        "⭐ Henüz favori eklenmedi.": "⭐ 暂无收藏。",
        "Ana Sayfa": extraTranslations.Chinese.home,
        "Yakınımda": extraTranslations.Chinese.nearby,
        "Yer Ekle": extraTranslations.Chinese.add,
        "Favoriler": extraTranslations.Chinese.favorites,
        "Profil": extraTranslations.Chinese.profile,
      },
      Hindi: {
        "Yerler": placeTitle.Hindi,
        "sonuç": "परिणाम",
        "📍 Gör": `📍 ${extraTranslations.Hindi.viewDetails}`,
        "⭐ Favorilere Ekle": `⭐ ${extraTranslations.Hindi.addFavorite}`,
        "⭐ Favorilerden Çıkar": `⭐ ${extraTranslations.Hindi.removeFavorite}`,
        "📤 Yeri Paylaş": `📤 ${extraTranslations.Hindi.share}`,
        "🗺️ Haritada Göster": `🗺️ ${extraTranslations.Hindi.showOnMap}`,
        "🗑️ Sil": `🗑️ ${extraTranslations.Hindi.delete}`,
        "Dil:": "भाषा:",
        "Ülke:": "देश:",
        "👤 Ekleyen:": "👤 जोड़ा गया:",
        "⭐ Favoriler": "⭐ पसंदीदा",
        "⭐ Henüz favori eklenmedi.": "⭐ अभी कोई पसंदीदा नहीं।",
        "Ana Sayfa": extraTranslations.Hindi.home,
        "Yakınımda": extraTranslations.Hindi.nearby,
        "Yer Ekle": extraTranslations.Hindi.add,
        "Favoriler": extraTranslations.Hindi.favorites,
        "Profil": extraTranslations.Hindi.profile,
      },
    };

    const replaceTextNodes = () => {
      const replacements = map[appLanguage];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      const nodes: Text[] = [];
      let current: Node | null;
      while ((current = walker.nextNode())) {
        if (current.nodeType === Node.TEXT_NODE) {
          nodes.push(current as Text);
        }
      }
      nodes.forEach((node) => {
        const original = node.nodeValue ?? "";
        const trimmed = original.trim();
        if (!trimmed || !replacements[trimmed]) return;
        const start = original.indexOf(trimmed);
        const end = start + trimmed.length;
        node.nodeValue =
          original.slice(0, start) +
          replacements[trimmed] +
          original.slice(end);
      });
    };

    // IMPORTANT: Do not observe characterData here.
    // Replacing text nodes inside a characterData MutationObserver
    // creates an endless mutation loop and freezes the whole page.
    replaceTextNodes();

    return undefined;
  }, [appLanguage]);

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

  const [activeLanguage] =
    useState("All");

  const [activeCountry] =
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

  const [loginBusy, setLoginBusy] = useState(false);

  // Pi Browser authentication uses the Pi SDK.
  // The SDK must be initialized once before Pi.authenticate().
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const preparePi = () => {
      if (cancelled) return;

      const pi = (window as any).Pi;
      if (pi) {
        try {
          Promise.resolve(
            pi.init({ version: "2.0", sandbox: false })
          ).catch((error: unknown) =>
            console.warn("Pi SDK init:", error)
          );
        } catch (error) {
          console.warn("Pi SDK init:", error);
        }
        return;
      }

      attempts += 1;
      if (attempts < 150) {
        window.setTimeout(preparePi, 100);
      }
    };

    preparePi();

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithPi = async () => {
    if (loginBusy) return;

    setLoginBusy(true);

    try {
      const waitForPi = () =>
        new Promise<any>((resolve, reject) => {
          let attempts = 0;

          const check = () => {
            const pi = (window as any).Pi;

            if (pi) {
              resolve(pi);
              return;
            }

            attempts += 1;
            if (attempts >= 150) {
              reject(new Error(t("piSdkError")));
              return;
            }

            window.setTimeout(check, 100);
          };

          check();
        });

      const pi = await Promise.race([
        waitForPi(),
        new Promise((_, reject) =>
          window.setTimeout(
            () => reject(new Error(t("piSdkError"))),
            15000
          )
        ),
      ]);

      const auth = await pi.authenticate(
        ["username"],
        (payment: any) => {
          console.warn(
            "Incomplete Pi payment found during authentication:",
            payment?.identifier
          );
        }
      );

      if (!auth?.user?.username || !auth?.accessToken) {
        throw new Error(t("piUserError"));
      }

      const controller = new AbortController();
      const backendTimer = window.setTimeout(
        () => controller.abort(),
        10000
      );

      let response: Response;
      try {
        response = await fetch(`${backendUrl}/user/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({
            authResult: auth,
          }),
        });
      } finally {
        window.clearTimeout(backendTimer);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || t("backendError"));
      }

      setSignedIn(true);
      setUsername(auth.user.username);

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

      setStatus(`✅ ${welcome} @${auth.user.username}`);
    } catch (error) {
      console.error("Pi login error:", error);

      setSignedIn(false);
      setUsername("");

      const message = error instanceof Error ? error.message : "";
      const timeoutError =
        error instanceof DOMException && error.name === "AbortError";

      setStatus(
        timeoutError
          ? `❌ ${t("backendError")}`
          : message
          ? `❌ ${message}`
          : `❌ ${t("loginFailed")}`
      );
    } finally {
      setLoginBusy(false);
    }
  };

  /* =======================================================
  LOAD PLACES
  ======================================================= */

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 12000);

        let response: Response;
        try {
          response = await fetch(
            `${backendUrl}/api/places`,
            {
              credentials: "include",
              signal: controller.signal,
            }
          );
        } finally {
          window.clearTimeout(timer);
        }

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

    const map =
      L.map(mapRef.current).setView(
        [41.0082, 28.9784],
        10
      );

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        maxZoom: 19,
      }
    ).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        maxZoom: 19,
        opacity: 0.9,
      }
    ).addTo(map);

    map.on(
      "click",
      (event) => {
        if (!mapInteractiveRef.current) return;

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

    setShowMap(true);
    setMapInteractive(true);
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



  /* =======================================================
  DELETE PLACE
  ======================================================= */

  const deletePlace = async (
    place: Place
  ) => {
    if (!place._id) {
      setStatus(
        "❌ Bu örnek kayıt silinemez."
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

      const deletedKey = getPlaceKey(place);

      setPlaces(
        (current) =>
          current.filter(
            (item) => getPlaceKey(item) !== deletedKey
          )
      );

      setFavorites(
        (current) =>
          current.filter(
            (item) => getPlaceKey(item) !== deletedKey
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


  useEffect(() => {
    try {
      localStorage.setItem(
        "pioneerMapInteractive",
        String(mapInteractive)
      );
    } catch {}

    const map = mapInstance.current;
    if (!map) return;

    if (mapInteractive) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }
  }, [mapInteractive]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !showMap) return;
    const timer = window.setTimeout(() => map.invalidateSize(), 180);
    return () => window.clearTimeout(timer);
  }, [showMap]);

  const filteredPlaces = places.filter((place) => {
    const categoryMatch = activeCategory === "All" || place.category === activeCategory;
    const languageMatch = activeLanguage === "All" || (place.language || "") === activeLanguage;
    const countryMatch = activeCountry === "All" || (place.country || "") === activeCountry;
    const query = searchText.trim().toLowerCase();
    const text = [
      place.name,
      place.description,
      place.username || "",
      place.category,
      place.language || "",
      place.country || "",
    ].join(" ").toLowerCase();
    const searchMatch = query === "" || text.includes(query);
    const nearbyMatch = !nearbyOnly || !userLocation ||
      distanceInKm(userLocation.lat, userLocation.lng, place.lat, place.lng) <= 50;
    return categoryMatch && languageMatch && countryMatch && searchMatch && nearbyMatch;
  }).sort((a, b) => {
    if (!userLocation) return 0;
    return distanceInKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
      distanceInKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
  });

  return (
    <div className="pm-app">
      <style>{`
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;background:#06111f}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#edf6ff}
button,input,select{font:inherit}
button{touch-action:manipulation}
.pm-app{min-height:100vh;background:#06111f;color:#edf6ff;padding-bottom:88px}
.pm-header{position:relative;overflow:hidden;padding:18px 20px 22px;background:linear-gradient(180deg,#071a31 0%,#082640 58%,#0a3046 100%);border-bottom:1px solid rgba(116,190,213,.16)}
.pm-header:before{content:"";position:absolute;inset:0;background:radial-gradient(700px 220px at 20% 0%,rgba(45,151,190,.20),transparent 70%),radial-gradient(500px 180px at 90% 20%,rgba(250,194,76,.08),transparent 72%);pointer-events:none}
.pm-header-row{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:14px}
.pm-brand{display:flex;align-items:center;gap:11px;min-width:0}
.pm-brand-mark{width:48px;height:56px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,.28))}
.pm-brand-copy{display:flex;flex-direction:column;line-height:1}
.pm-brand-name{font-size:27px;font-weight:950;letter-spacing:-1.2px;color:#fff}
.pm-brand-sub{margin-top:6px;color:#94b9c9;font-size:11px;font-weight:800;letter-spacing:.7px;text-transform:uppercase}
.pm-actions{display:flex;align-items:center;gap:8px}
.pm-language,.pm-pill{height:42px;border-radius:13px;padding:0 13px;border:1px solid rgba(133,194,211,.24);background:rgba(5,25,43,.72);color:#eefaff;font-weight:850;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.15)}
.pm-language:focus,.pm-pill:focus{outline:2px solid #70c8dc;outline-offset:2px}
.pm-language option{color:#102238;background:#fff}
.pm-pill{border-color:rgba(245,197,86,.42);background:linear-gradient(180deg,#f2ca65,#dcae3f);color:#17202b;box-shadow:0 8px 22px rgba(213,166,55,.18)}
.pm-search{position:relative;z-index:3;display:flex;align-items:center;gap:12px;width:min(920px,100%);height:56px;margin:18px auto 0;padding:0 18px;border:1px solid rgba(136,203,220,.25);border-radius:16px;background:rgba(3,22,39,.70);box-shadow:0 14px 30px rgba(0,0,0,.22);backdrop-filter:blur(16px)}
.pm-search span{font-size:25px;color:#78bdd0}.pm-search input{width:100%;border:0;outline:0;background:transparent;color:#f5fbff;font-size:16px;font-weight:650}.pm-search input::placeholder{color:#8eacba}
.pm-main{padding:18px 18px 34px;background:linear-gradient(180deg,#071727 0%,#06111f 48%,#06111f 100%)}
.pm-map-card{position:relative;overflow:hidden;border:1px solid rgba(103,181,205,.26);border-radius:20px;background:#081a2a;box-shadow:0 20px 48px rgba(0,0,0,.34)}
.pm-map{height:610px;width:100%;transition:height .28s ease}.pm-map-card.collapsed{min-height:70px}.pm-map-card.collapsed .pm-map{height:0;min-height:0}.pm-map-card.collapsed .pm-map-legend{display:none}
.pm-map .leaflet-control-zoom{margin:18px 0 0 18px!important;border:0!important;box-shadow:0 10px 22px rgba(0,0,0,.28)}.pm-map .leaflet-control-zoom a{width:44px;height:44px;line-height:44px;font-size:23px;font-weight:900;background:#f5fbff;color:#0b2337;border:0;border-bottom:1px solid #d8e2e7}.pm-map .leaflet-control-zoom a:first-child{border-radius:11px 11px 0 0}.pm-map .leaflet-control-zoom a:last-child{border-radius:0 0 11px 11px;border-bottom:0}.pm-map .leaflet-control-attribution{font-size:9px;padding:2px 5px}
.pm-map-overlay{position:absolute;inset:0;pointer-events:none;z-index:500}.pm-map-legend{position:absolute;top:18px;right:18px;width:172px;padding:8px;border:1px solid rgba(129,203,220,.25);border-radius:15px;background:rgba(4,22,37,.86);box-shadow:0 16px 32px rgba(0,0,0,.28);backdrop-filter:blur(14px);pointer-events:auto}.pm-legend-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px;border:0;border-radius:9px;background:transparent;color:#eaf8ff;font-size:12px;font-weight:850;text-align:left;cursor:pointer}.pm-legend-item:hover{background:rgba(255,255,255,.07)}.pm-legend-dot{width:11px;height:11px;border-radius:50%;flex:none;box-shadow:0 0 0 3px rgba(255,255,255,.08)}
.pm-map-controls{position:absolute;left:18px;right:18px;bottom:18px;display:flex;gap:9px;pointer-events:auto}.pm-map-control{height:42px;padding:0 15px;border:1px solid rgba(120,196,216,.30);border-radius:13px;background:rgba(4,25,42,.90);color:#edfaff;font-size:12px;font-weight:900;cursor:pointer;box-shadow:0 10px 22px rgba(0,0,0,.30);backdrop-filter:blur(12px)}.pm-map-control:hover{background:#0c3a4d}.pm-map-control.active{background:linear-gradient(180deg,#e8c75f,#cda83e);border-color:rgba(255,226,132,.7);color:#152332}.pm-map-control.nearby{margin-left:auto}
.pm-category-strip{display:flex;gap:10px;padding:15px 0 3px;overflow-x:auto;scrollbar-width:none}.pm-category-strip::-webkit-scrollbar{display:none}.pm-cat{flex:0 0 118px;min-height:78px;border:1px solid rgba(111,184,203,.18);border-radius:15px;background:#0a1e31;color:#b8ced9;padding:10px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:7px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.16)}.pm-cat:hover{border-color:rgba(129,202,220,.38)}.pm-cat.active{background:linear-gradient(145deg,#10495b,#0d3042);border-color:rgba(232,198,91,.62);color:#fff;box-shadow:0 10px 24px rgba(0,0,0,.22)}.pm-cat-icon{font-size:23px;line-height:1}.pm-cat-label{font-size:12px;font-weight:900}
.pm-list-panel{margin-top:16px;padding:16px;border:1px solid rgba(111,184,203,.17);border-radius:18px;background:#081a2b;box-shadow:0 12px 30px rgba(0,0,0,.20)}.pm-list-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.pm-list-head strong{font-size:19px;letter-spacing:-.3px}.pm-count{color:#87aab8;font-size:12px;font-weight:800}
.pm-content-grid{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.pm-discover,.pm-mini-card,.pm-user-card,.pm-news-card,.pm-news-feed{border:1px solid rgba(111,184,203,.17);background:#081b2c;border-radius:18px;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.20)}.pm-discover{min-height:205px;padding:20px;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(180deg,rgba(4,24,40,.05),rgba(4,22,37,.92)),#0b2c3e}.pm-discover h2{margin:0 0 7px;font-size:25px;letter-spacing:-.7px}.pm-discover p{margin:0 0 15px;color:#b3cbd5;font-size:13px;line-height:1.5}.pm-discover button{align-self:flex-start;border:0;border-radius:11px;padding:10px 14px;background:#e7c45d;color:#172332;font-size:12px;font-weight:950;cursor:pointer}.pm-mini-card{min-height:96px;display:grid;grid-template-columns:56px 1fr;gap:12px;align-items:center;padding:12px;text-align:left;color:#fff;cursor:pointer}.pm-mini-image{width:56px;height:56px;display:grid;place-items:center;border-radius:14px;background:#0d3041;font-size:27px}.pm-mini-card h3{margin:0 0 4px;font-size:14px}.pm-mini-card p{margin:0;color:#87aab8;font-size:11px;font-weight:750}
.pm-user-news{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.pm-user-row,.pm-news-row{min-height:76px;padding:13px 15px;display:flex;align-items:center;gap:12px}.pm-avatar{width:43px;height:43px;border-radius:50%;background:linear-gradient(145deg,#f1c65b,#d39e32)}.pm-user-row strong,.pm-news-row strong{display:block;font-size:13px}.pm-user-row span,.pm-news-row span{display:block;color:#87aab8;font-size:11px;margin-top:4px}.pm-arrow{margin-left:auto!important;color:#6d9aaa!important;font-size:25px!important}.pm-news-card{color:#fff;text-decoration:none}.pm-news-icon{width:43px;height:43px;border-radius:13px;background:#0c3548;position:relative}.pm-news-icon:after{content:"P";position:absolute;inset:0;display:grid;place-items:center;color:#f0c85b;font-weight:950}
.pm-news-feed{margin-top:16px;padding:15px}.pm-news-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}.pm-news-head strong{font-size:15px}.pm-news-head a{color:#8fc2d1;text-decoration:none;font-size:11px;font-weight:850}.pm-news-list{display:grid;gap:7px}.pm-news-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:#0a2133;color:#e9f7fb;text-decoration:none}.pm-news-badge{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:#0e394b;color:#edc55b;font-weight:950;font-size:12px;flex:none}.pm-news-copy{min-width:0;flex:1}.pm-news-copy strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-news-copy span{display:block;margin-top:3px;color:#86a8b5;font-size:10px;line-height:1.35}.pm-news-date{color:#6d8e9c;font-size:9px;font-weight:800;white-space:nowrap}
.pm-status{position:fixed;left:50%;bottom:102px;transform:translateX(-50%);z-index:10050;max-width:calc(100% - 30px);padding:11px 15px;border:1px solid rgba(123,198,216,.28);border-radius:12px;background:#09263a;color:#eefaff;box-shadow:0 12px 28px rgba(0,0,0,.35);font-size:12px;font-weight:850}
.pm-bottom{position:fixed;left:0;right:0;bottom:0;z-index:10000;display:grid;grid-template-columns:repeat(5,1fr);padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:rgba(4,17,29,.96);border-top:1px solid rgba(112,184,203,.16);box-shadow:0 -14px 32px rgba(0,0,0,.30);backdrop-filter:blur(18px)}.pm-nav{border:0;background:transparent;color:#7896a3;font-size:10px;font-weight:850;cursor:pointer;padding:5px 2px;border-radius:12px}.pm-nav.active{color:#e8c45b;background:rgba(232,196,91,.08)}.pm-nav span{display:block;font-size:21px;margin-bottom:3px}.pm-add{width:54px;height:54px;margin:-28px auto 0;display:grid!important;place-items:center;border:4px solid #061522;border-radius:50%;background:linear-gradient(145deg,#e8c45b,#cba23b);color:#152232;font-size:31px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
.pm-overlay-panel{position:fixed;inset:0;bottom:78px;z-index:9000;overflow-y:auto;background:#06111f;padding:14px}
@media(max-width:900px){.pm-content-grid{grid-template-columns:1fr 1fr}.pm-discover{grid-column:1/-1}.pm-user-news{grid-template-columns:1fr}}
@media(max-width:600px){.pm-app{padding-bottom:82px}.pm-header{padding:13px 12px 16px}.pm-brand-mark{width:41px;height:48px}.pm-brand-name{font-size:22px}.pm-brand-sub{font-size:9px}.pm-actions{gap:5px}.pm-language,.pm-pill{height:38px;padding:0 9px;font-size:11px}.pm-pill{max-width:130px}.pm-search{height:52px;margin-top:13px;border-radius:14px;padding:0 14px}.pm-search input{font-size:14px}.pm-main{padding:10px 10px 25px}.pm-map{height:455px}.pm-map-legend{top:10px;right:10px;width:145px}.pm-legend-item{font-size:10px;padding:7px}.pm-map-controls{left:10px;right:10px;bottom:10px}.pm-map-control{height:38px;padding:0 11px;font-size:10px}.pm-category-strip{gap:8px;padding-top:10px}.pm-cat{flex-basis:92px;min-height:72px;padding:9px;border-radius:13px}.pm-cat-icon{font-size:20px}.pm-cat-label{font-size:10px}.pm-list-panel{margin-top:10px;padding:12px}.pm-content-grid{grid-template-columns:1fr;gap:9px}.pm-discover{grid-column:auto;min-height:180px;padding:16px}.pm-discover h2{font-size:22px}.pm-mini-card{min-height:82px}.pm-user-news{gap:9px}.pm-news-item{align-items:flex-start}.pm-news-date{display:none}}
`}</style>

      <header className="pm-header">
        <div className="pm-shell">
          <div className="pm-header-row">
            <div className="pm-brand"><div className="pm-brand-mark"><span /></div><div className="pm-brand-name">Pioneer<b>Map</b></div></div>
            <div className="pm-actions">
              <select className="pm-pill" value={appLanguage} onChange={(e)=>setAppLanguage(e.target.value as AppLanguage)} aria-label={t("languageSelector")}>{appLanguages.map((language)=><option key={language.value} value={language.value}>{language.label}</option>)}</select>
              <button className="pm-pill" onClick={loginWithPi}>{signedIn ? `✓ @${username}` : t("signIn")}</button>
            </div>
          </div>
          <label className="pm-search"><span>⌕</span><input value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder={t("search").replace("🔎 ","")} /></label>
        </div>
      </header>

      <main className="pm-main">
        <div className="pm-shell">
          <section className={`pm-map-card ${showMap ? "" : "collapsed"}`}>
            <div className="pm-map" ref={mapRef} />
            <div className="pm-map-overlay">
              <div className="pm-map-legend">{["Stays","Shops","Food","Services","Jobs"].map((cat)=><button className="pm-legend-item" key={cat} onClick={()=>{setActiveCategory(cat as Category);setShowMap(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),100)}}><span className="pm-legend-dot" style={{background:categoryIcons[cat as Exclude<Category,"All">].color}} />{categoryLabel(cat as Exclude<Category,"All">)}</button>)}</div>
              {showMap ? <div className="pm-map-controls"><button className="pm-map-control" onClick={()=>{setShowMap(false);window.setTimeout(()=>mapInstance.current?.invalidateSize(),120)}}>{appLanguage === "English" ? "◉ Hide Map" : `◉ ${t("map").replace("🗺️ ","")}`}</button><button className="pm-map-control nearby" onClick={findNearbyPlaces}>➤ {t("nearby").replace("📍 ","")}</button></div> : <div className="pm-map-controls"><button className="pm-map-control active" onClick={()=>{setShowMap(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),150)}}>{appLanguage === "English" ? "◉ Show on Map" : `◉ ${t("map").replace("🗺️ ","")}`}</button></div>}
            </div>
          </section>

          <div className="pm-category-strip">{categories.map((cat)=><button key={cat.name} className={`pm-cat ${activeCategory===cat.name ? "active" : ""}`} onClick={()=>{setActiveCategory(cat.name);setShowMap(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),100)}}><span className="pm-cat-icon">{cat.name === "All" ? "▦" : cat.icon}</span><span className="pm-cat-label">{categoryLabel(cat.name)}</span></button>)}</div>

          <section className="pm-list-panel"><div className="pm-list-head"><strong>{t("places")}</strong><span className="pm-count">{filteredPlaces.length} {t("results")}</span></div><PlaceList places={filteredPlaces} categoryIcons={{Stays:"🏠",Shops:"🛍️",Food:"🍔",Services:"🔧",Jobs:"💼"}} onSelect={(place)=>setSelectedPlace(places.find(item=>getPlaceKey(item)===getPlaceKey(place))||(place as Place))} onDelete={(place)=>deletePlace(place as Place)} onToggleFavorite={(place)=>toggleFavorite(place as Place)} isFavorite={(place)=>isFavorite(place as Place)} labels={{title:t("places"),empty:extraTranslations[appLanguage].noPlaces,results:t("results"),view:extraTranslations[appLanguage].viewDetails,favorite:extraTranslations[appLanguage].addFavorite,favorited:extraTranslations[appLanguage].removeFavorite,delete:extraTranslations[appLanguage].delete,anonymous:t("anonymous")}}/></section>

          <section className="pm-content-grid">
            <div className="pm-discover"><h2>{appLanguage === "English" ? "Discover Amazing Places" : appLanguage === "Turkish" ? "Harika Yerleri Keşfet" : t("allPlaces").replace("🌍 ","")}</h2><p>{appLanguage === "English" ? "Explore the best places around you with PioneerMap." : t("appDescription")}</p><button onClick={()=>{setShowMap(true);setActiveCategory("All");setSearchText("");window.setTimeout(()=>mapInstance.current?.invalidateSize(),120)}}>{appLanguage === "English" ? "Explore Now" : t("allPlaces").replace("🌍 ","")} →</button></div>
            {["Stays","Shops","Food","Services"].map((cat)=><button key={cat} className="pm-mini-card" onClick={()=>{setActiveCategory(cat as Exclude<Category,"All">);setShowMap(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),100)}}><div className="pm-mini-image">{categoryIcons[cat as Exclude<Category,"All">].icon}</div><div><h3>{categoryLabel(cat as Exclude<Category,"All">)}</h3><p>{places.filter(p=>p.category===cat).length} {t("results")}</p></div></button>)}
          </section>

          <section className="pm-user-news">
            <div className="pm-user-card"><div className="pm-user-row"><div className="pm-avatar" /><div><strong>{signedIn ? `@${username}` : "Dilek"}</strong><span>{signedIn ? t("connected") : (appLanguage === "English" ? "Pioneer • Explorer" : "Pioneer")}</span></div><span className="pm-arrow">›</span></div></div>
            <a className="pm-news-card" href={activeNews.url} target="_blank" rel="noreferrer"><div className="pm-news-row"><div className="pm-news-icon" /><div style={{minWidth:0,flex:1}}><strong>Pi News</strong><span>{activeNews.title}</span></div><span className="pm-arrow">›</span></div></a>
          </section>

          <section className="pm-news-feed"><div className="pm-news-head"><strong>🟣 Pi News</strong><a href="https://minepi.com/blog/" target="_blank" rel="noreferrer">{appLanguage === "English" ? "Official Pi updates →" : "Pi News →"}</a></div><div className="pm-news-list">{piNews.map((item,index)=><a key={item.url} className="pm-news-item" href={item.url} target="_blank" rel="noreferrer"><span className="pm-news-badge">P</span><span className="pm-news-copy"><strong>{index === newsIndex % piNews.length ? "● " : ""}{item.title}</strong><span>{item.summary}</span></span><span className="pm-news-date">{item.date}</span></a>)}</div></section>

          {showForm && <AddPlaceForm placeName={placeName} setPlaceName={setPlaceName} placeDescription={placeDescription} setPlaceDescription={setPlaceDescription} placeCategory={placeCategory} setPlaceCategory={(value:string)=>setPlaceCategory(value as Exclude<Category,"All">)} placeLanguage={placeLanguage} setPlaceLanguage={setPlaceLanguage} placeCountry={placeCountry} setPlaceCountry={setPlaceCountry} categories={["Stays","Shops","Food","Services","Jobs"]} languages={languages.map(x=>x.value)} countries={countries.map(x=>x.value)} selectedLocation={selectedLocation} onMapSelect={()=>{setShowMap(true);setMapInteractive(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),100)}} onSubmit={addPlace} onCancel={()=>{setShowForm(false);setSelectedLocation(null);setPlaceImage("")}} submitting={imageUploading} placeImage={placeImage} setPlaceImage={setPlaceImage} imageUploading={imageUploading} labels={{title:t("addPlace"),name:t("placeName"),category:extraTranslations[appLanguage].category,description:t("description"),language:extraTranslations[appLanguage].language,country:extraTranslations[appLanguage].country,photo:extraTranslations[appLanguage].placeImage,photoPreparing:extraTranslations[appLanguage].preparingPhoto,removePhoto:extraTranslations[appLanguage].removeImage,location:extraTranslations[appLanguage].location,saving:t("saving"),savePlace:extraTranslations[appLanguage].savePlace,imageTooLarge:extraTranslations[appLanguage].photoTooLarge}}/>}

          {selectedPlace && <PlaceDetails place={selectedPlace} onClose={()=>setSelectedPlace(null)} onShowOnMap={()=>{const map=mapInstance.current;if(map){setShowMap(true);setMapInteractive(true);map.setView([Number(selectedPlace.lat),Number(selectedPlace.lng)],15);window.setTimeout(()=>map.invalidateSize(),120)}}} onDelete={()=>deletePlace(selectedPlace)} labels={{language:extraTranslations[appLanguage].language,country:extraTranslations[appLanguage].country,anonymous:t("anonymous"),addFavorite:extraTranslations[appLanguage].addFavorite,removeFavorite:extraTranslations[appLanguage].removeFavorite,share:extraTranslations[appLanguage].share,showOnMap:extraTranslations[appLanguage].showOnMap,delete:extraTranslations[appLanguage].delete}} isFavorite={isFavorite(selectedPlace)} onToggleFavorite={()=>toggleFavorite(selectedPlace)} onShare={()=>sharePlace(selectedPlace)}/>} 


        </div>
      </main>

      {status && <div className="pm-status" role="status">{status}</div>}
      <nav className="pm-bottom"><button className={`pm-nav ${activeNav==="home"?"active":""}`} onClick={()=>{setActiveNav("home");setSelectedPlace(null);setNearbyOnly(false)}}><span>⌂</span>{extraTranslations[appLanguage].home}</button><button className={`pm-nav ${activeNav==="nearby"?"active":""}`} onClick={()=>{setActiveNav("nearby");findNearbyPlaces()}}><span>⌖</span>{extraTranslations[appLanguage].nearby}</button><button className="pm-nav" onClick={()=>{setActiveNav("add");setShowForm(true);setShowMap(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),100)}}><span className="pm-add">+</span>{extraTranslations[appLanguage].add}</button><button className={`pm-nav ${activeNav==="favorites"?"active":""}`} onClick={()=>setActiveNav("favorites")}><span>★</span>{extraTranslations[appLanguage].favorites}</button><button className={`pm-nav ${activeNav==="profile"?"active":""}`} onClick={()=>{setActiveNav("profile");setStatus(signedIn?`@${username}`:t("signInFirst"))}}><span>♙</span>{extraTranslations[appLanguage].profile}</button></nav>
      {activeNav==="favorites" && <div className="pm-overlay-panel"><Favorites favorites={favorites} labels={{title:extraTranslations[appLanguage].favorites,empty:extraTranslations[appLanguage].emptyFavorites,view:extraTranslations[appLanguage].viewDetails,remove:extraTranslations[appLanguage].removeFavorite}} onRemove={(id)=>setFavorites(current=>current.filter(place=>place._id!==id))} onPlaceClick={(place)=>{const found=places.find(item=>item._id===place._id);if(found){setSelectedPlace(found);setActiveNav("home")}}}/></div>}
    </div>
  );

};

export default PioneerMapPage;

