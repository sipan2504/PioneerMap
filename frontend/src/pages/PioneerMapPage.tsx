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
        .pm-app{min-height:100vh;background:#020c1b;color:#fff;padding-bottom:98px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden}
        .pm-shell{width:min(1120px,100%);margin:0 auto}
        .pm-header{position:relative;overflow:hidden;background-image:linear-gradient(180deg,rgba(2,15,36,.12),rgba(3,22,47,.84)),url("data:image/jpeg;base64,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");background-size:cover;background-position:center 44%;padding:18px 28px 22px;border-bottom:1px solid rgba(80,171,255,.45);box-shadow:0 8px 30px rgba(0,0,0,.28)}
        .pm-header:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,18,42,.5),transparent 48%,rgba(0,25,60,.32));pointer-events:none}
        .pm-header-row{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:18px}
        .pm-brand{display:flex;align-items:center;gap:12px;min-width:0}
        .pm-brand-mark{width:58px;height:66px;position:relative;display:grid;place-items:center;background:linear-gradient(145deg,#ffd94a,#ffae00);clip-path:path("M29 0C13 0 0 13 0 29c0 21 29 37 29 37s29-16 29-37C58 13 45 0 29 0Z");filter:drop-shadow(0 8px 12px rgba(0,0,0,.25))}
        .pm-brand-mark span{width:24px;height:24px;border-radius:50%;background:#fff}
        .pm-brand-name{font-size:34px;letter-spacing:-1.7px;font-weight:950;color:#fff;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.3)}
        .pm-brand-name b{color:#ffc21a}
        .pm-actions{display:flex;align-items:center;gap:10px}
        .pm-pill{appearance:none;border:1px solid rgba(88,180,255,.68);background:linear-gradient(145deg,rgba(12,71,142,.94),rgba(4,39,92,.92));color:#fff;border-radius:32px;padding:13px 18px;font-weight:900;font-size:15px;backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer}
        .pm-pill option{color:#13213a;background:#fff}
        .pm-pill:focus{outline:2px solid #62b8ff;outline-offset:2px}
        .pm-search{position:relative;z-index:3;display:flex;align-items:center;gap:13px;margin:18px auto 0;background:rgba(12,64,119,.82);color:#fff;border:1px solid rgba(115,194,255,.65);border-radius:34px;padding:0 24px;height:62px;box-shadow:0 12px 32px rgba(0,0,0,.28);max-width:1040px;backdrop-filter:blur(12px)}
        .pm-search span{font-size:31px;line-height:1}.pm-search input{width:100%;border:0;outline:0;background:transparent;color:#fff;font-size:20px;font-weight:500}.pm-search input::placeholder{color:#fff;opacity:.94}
        .pm-main{padding:14px 24px 28px;background:radial-gradient(circle at 50% 0%,#082b56 0,#03172e 34%,#020c1b 75%)}
        .pm-map-card{position:relative;overflow:hidden;border:1px solid rgba(71,176,255,.65);background:#07182e;border-radius:22px;box-shadow:0 18px 44px rgba(0,0,0,.36)}.pm-map-card.collapsed{min-height:76px}.pm-map-card.collapsed .pm-map{height:0;min-height:0;border:0}.pm-map-card.collapsed .pm-map-legend{display:none}.pm-map{height:520px;width:100%;transition:height .25s ease}
        .pm-map .leaflet-control-zoom{margin:22px 0 0 16px;border:0!important;box-shadow:0 8px 20px rgba(0,0,0,.28)}.pm-map .leaflet-control-zoom a{width:50px;height:50px;line-height:50px;font-size:28px;font-weight:800;background:#fff;color:#071a33;border:0;border-bottom:1px solid #d7e0ea}.pm-map .leaflet-control-zoom a:first-child{border-radius:12px 12px 0 0}.pm-map .leaflet-control-zoom a:last-child{border-radius:0 0 12px 12px;border-bottom:0}.pm-map .leaflet-control-attribution{font-size:10px;border-radius:7px 0 0 0;padding:2px 6px}
        .pm-map-overlay{position:absolute;inset:0;pointer-events:none;z-index:500}.pm-map-controls{position:absolute;left:22px;right:22px;bottom:20px;display:flex;gap:10px;pointer-events:auto}.pm-map-control{border:1px solid rgba(59,167,255,.8);background:rgba(3,42,91,.94);color:#fff;border-radius:25px;padding:12px 18px;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 9px 22px rgba(0,0,0,.3);backdrop-filter:blur(10px)}.pm-map-control:hover{background:#086bd0}.pm-map-control.active{background:linear-gradient(135deg,#168dff,#0a57d7);border-color:#6fc1ff}.pm-map-control.nearby{margin-left:auto}
        .pm-map-legend{position:absolute;right:22px;top:22px;width:180px;padding:12px;background:rgba(3,21,43,.91);border:1px solid rgba(56,171,255,.8);border-radius:18px;box-shadow:0 14px 30px rgba(0,0,0,.34);pointer-events:auto;backdrop-filter:blur(12px)}.pm-legend-item{width:100%;border:0;background:transparent;color:#fff;padding:9px 7px;display:flex;align-items:center;gap:11px;font-weight:900;cursor:pointer;border-radius:10px;text-align:left;font-size:15px}.pm-legend-item:hover{background:rgba(255,255,255,.08)}.pm-legend-dot{width:18px;height:18px;border-radius:50%;flex:none;box-shadow:0 0 12px rgba(255,255,255,.18)}
        .pm-category-strip{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:14px 0 4px}.pm-cat{min-height:112px;border:1px solid rgba(71,174,255,.32);background:linear-gradient(145deg,#082a55,#061a35);color:#dcecff;border-radius:20px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.2)}.pm-cat.active{background:linear-gradient(145deg,#118dff,#0b59d8);border-color:#54b5ff;box-shadow:0 10px 28px rgba(0,116,255,.3)}.pm-cat-icon{font-size:34px;line-height:1}.pm-cat-label{font-size:16px;font-weight:950}
        .pm-content-grid{display:grid;grid-template-columns:1.35fr .88fr .88fr;gap:16px;margin-top:16px}.pm-discover,.pm-mini-card,.pm-user-card,.pm-news-card,.pm-news-feed{border:1px solid rgba(57,165,255,.3);background:#06234a;border-radius:20px;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.22)}.pm-discover{min-height:220px;padding:20px;display:flex;flex-direction:column;justify-content:flex-end;background-image:linear-gradient(180deg,rgba(2,24,54,.05),rgba(2,21,50,.86)),url("data:image/jpeg;base64,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");background-size:cover;background-position:center}.pm-discover h2{font-size:30px;line-height:1.04;margin:0 0 8px;text-shadow:0 2px 8px rgba(0,0,0,.45)}.pm-discover p{margin:0 0 15px;color:#eef7ff;font-size:15px;line-height:1.45;text-shadow:0 1px 5px rgba(0,0,0,.4)}.pm-discover button{align-self:flex-start;border:0;background:#1592ff;color:#fff;border-radius:14px;padding:12px 18px;font-weight:950;font-size:15px;cursor:pointer;box-shadow:0 8px 18px rgba(0,126,255,.3)}
        .pm-mini-card{min-height:104px;padding:12px;display:grid;grid-template-columns:62px 1fr;align-items:center;gap:12px;border-radius:20px;color:#fff;cursor:pointer}.pm-mini-card:nth-child(2){background:linear-gradient(145deg,#1592ff,#0765db)}.pm-mini-card:nth-child(3){background:linear-gradient(145deg,#ff2b94,#e40b73)}.pm-mini-card:nth-child(4){background:linear-gradient(145deg,#ffbd24,#ef8700)}.pm-mini-card:nth-child(5){background:linear-gradient(145deg,#11c99c,#009d83)}.pm-mini-image{width:62px;height:62px;border-radius:17px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:34px}.pm-mini-card h3{font-size:17px;margin:0 0 4px;color:#fff}.pm-mini-card p{font-size:11px;color:rgba(255,255,255,.84);margin:0}
        .pm-user-news{display:grid;grid-template-columns:1fr 1.2fr;gap:16px;margin-top:16px}.pm-user-row,.pm-news-row{display:flex;gap:12px;align-items:center;padding:14px 16px;min-height:70px}.pm-avatar{width:46px;height:46px;border-radius:50%;background-image:url("data:image/jpeg;base64,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");background-size:cover;background-position:center;flex:none;border:2px solid #fff}.pm-user-row strong,.pm-news-row strong{display:block;font-size:16px}.pm-user-row span,.pm-news-row small{font-size:11px;color:#a8c6e8}.pm-arrow{margin-left:auto;color:#d4eaff;font-size:25px}.pm-news-icon{width:46px;height:46px;border-radius:50%;background-image:url("data:image/jpeg;base64,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");background-size:cover;background-position:center;flex:none;border:2px solid #b855ff}.pm-news-card{cursor:pointer;background:linear-gradient(145deg,#082d5b,#061e40)}
        .pm-news-feed{margin-top:16px;padding:15px;background:linear-gradient(145deg,#062a55,#041a35)}.pm-news-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.pm-news-head strong{font-size:19px}.pm-news-head a{color:#69bcff;font-size:12px;font-weight:900;text-decoration:none}.pm-news-list{display:grid;gap:9px}.pm-news-item{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid rgba(70,173,255,.22);border-radius:14px;background:rgba(4,25,53,.8);color:#fff;text-decoration:none}.pm-news-badge{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(145deg,#7d25ff,#ff39a6);font-weight:950;flex:none}.pm-news-copy{min-width:0;flex:1}.pm-news-copy strong{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-news-copy span{display:block;margin-top:3px;font-size:11px;color:#a9c8e8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-news-date{font-size:10px;color:#7db8e8;white-space:nowrap}
        .pm-list-panel{margin-top:16px;background:#06234a;border:1px solid rgba(57,165,255,.25);border-radius:20px;padding:15px;box-shadow:0 10px 24px rgba(0,0,0,.16)}.pm-list-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.pm-list-head strong{font-size:18px}.pm-count{font-size:11px;color:#91b4d9}
        .pm-status{position:fixed;left:50%;bottom:105px;transform:translateX(-50%);z-index:10050;max-width:calc(100% - 30px);background:#08376e;color:#fff;border:1px solid rgba(104,190,255,.5);padding:11px 16px;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.32);font-size:12px;font-weight:900}.pm-bottom{position:fixed;left:0;right:0;bottom:0;z-index:10000;background:rgba(2,16,35,.97);border-top:1px solid rgba(63,172,255,.24);display:grid;grid-template-columns:repeat(5,1fr);padding:9px 12px calc(9px + env(safe-area-inset-bottom));box-shadow:0 -14px 32px rgba(0,0,0,.34);backdrop-filter:blur(14px)}.pm-nav{border:0;background:transparent;color:#9db8d8;font-size:12px;font-weight:900;cursor:pointer;padding:6px 3px;border-radius:15px}.pm-nav.active{color:#49aaff;background:rgba(22,129,245,.14)}.pm-nav span{display:block;font-size:25px;margin-bottom:3px}.pm-add{background:linear-gradient(145deg,#168eff,#075bdc);color:#fff;border-radius:50%;width:60px;height:60px;margin:-30px auto 0;border:4px solid #03152d;font-size:34px;display:grid!important;place-items:center;box-shadow:0 8px 24px rgba(13,130,255,.45)}
        .pm-overlay-panel{position:fixed;inset:0;bottom:84px;z-index:9000;overflow-y:auto;background:#06162c;padding:14px}
        @media(max-width:900px){.pm-category-strip{grid-template-columns:repeat(3,1fr)}.pm-content-grid{grid-template-columns:1fr 1fr}.pm-discover{grid-column:1/-1}.pm-user-news{grid-template-columns:1fr}}
        @media(max-width:600px){.pm-header{padding:12px 12px 18px}.pm-header-row{gap:8px}.pm-brand-mark{width:44px;height:51px}.pm-brand-name{font-size:25px}.pm-actions{gap:5px}.pm-pill{padding:10px 11px;font-size:12px;max-width:145px}.pm-search{height:57px;margin-top:13px;padding:0 17px;border-radius:30px}.pm-search input{font-size:16px}.pm-main{padding:10px 10px 22px}.pm-map{height:440px}.pm-map-controls{left:14px;right:14px;bottom:14px;justify-content:space-between}.pm-map-control{font-size:12px;padding:10px 13px}.pm-map-legend{right:10px;top:10px;width:150px}.pm-legend-item{font-size:12px;padding:7px 5px}.pm-category-strip{gap:8px}.pm-cat{min-height:92px;border-radius:17px}.pm-cat-icon{font-size:27px}.pm-cat-label{font-size:13px}.pm-content-grid{gap:10px}.pm-discover{min-height:185px;padding:16px}.pm-discover h2{font-size:25px}.pm-mini-card{min-height:96px;grid-template-columns:52px 1fr;padding:10px}.pm-mini-image{width:52px;height:52px;font-size:28px}.pm-mini-card h3{font-size:14px}.pm-user-news{gap:10px}.pm-news-item{align-items:flex-start}.pm-news-date{display:none}}
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

          <section className="pm-list-panel"><div className="pm-list-head"><strong>{t("places")}</strong><span className="pm-count">{filteredPlaces.length} {t("results")}</span></div><PlaceList places={filteredPlaces} categoryIcons={{Stays:"🏠",Shops:"🛍️",Food:"🍔",Services:"🔧",Jobs:"💼"}} onSelect={(place)=>setSelectedPlace(places.find(item=>getPlaceKey(item)===getPlaceKey(place))||(place as Place))} onDelete={(place)=>deletePlace(place as Place)} onToggleFavorite={(place)=>toggleFavorite(place as Place)} isFavorite={(place)=>isFavorite(place as Place)} labels={{title:t("places"),empty:extraTranslations[appLanguage].noPlaces,results:t("results"),view:extraTranslations[appLanguage].viewDetails,favorite:extraTranslations[appLanguage].addFavorite,favorited:extraTranslations[appLanguage].removeFavorite,delete:extraTranslations[appLanguage].delete,anonymous:t("anonymous")}}/></section>
        </div>
      </main>

      {status && <div className="pm-status" role="status">{status}</div>}
      <nav className="pm-bottom"><button className={`pm-nav ${activeNav==="home"?"active":""}`} onClick={()=>{setActiveNav("home");setSelectedPlace(null);setNearbyOnly(false)}}><span>⌂</span>{extraTranslations[appLanguage].home}</button><button className={`pm-nav ${activeNav==="nearby"?"active":""}`} onClick={()=>{setActiveNav("nearby");findNearbyPlaces()}}><span>⌖</span>{extraTranslations[appLanguage].nearby}</button><button className="pm-nav" onClick={()=>{setActiveNav("add");setShowForm(true);setShowMap(true);window.setTimeout(()=>mapInstance.current?.invalidateSize(),100)}}><span className="pm-add">+</span>{extraTranslations[appLanguage].add}</button><button className={`pm-nav ${activeNav==="favorites"?"active":""}`} onClick={()=>setActiveNav("favorites")}><span>★</span>{extraTranslations[appLanguage].favorites}</button><button className={`pm-nav ${activeNav==="profile"?"active":""}`} onClick={()=>{setActiveNav("profile");setStatus(signedIn?`@${username}`:t("signInFirst"))}}><span>♙</span>{extraTranslations[appLanguage].profile}</button></nav>
      {activeNav==="favorites" && <div className="pm-overlay-panel"><Favorites favorites={favorites} labels={{title:extraTranslations[appLanguage].favorites,empty:extraTranslations[appLanguage].emptyFavorites,view:extraTranslations[appLanguage].viewDetails,remove:extraTranslations[appLanguage].removeFavorite}} onRemove={(id)=>setFavorites(current=>current.filter(place=>place._id!==id))} onPlaceClick={(place)=>{const found=places.find(item=>item._id===place._id);if(found){setSelectedPlace(found);setActiveNav("home")}}}/></div>}
    </div>
  );

};

export default PioneerMapPage;

// PioneerMap repaired version - replace the existing PioneerMapPage.tsx with this file.
