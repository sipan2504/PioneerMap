import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";

const categories = [
  "Tümü",
  "Mağazalar",
  "Market",
  "Restoran",
  "Giyim",
  "Hizmetler",
  "İkinci El",
  "Elektronik",
  "Araçlar",
];

const quickPlaces = ["Kırtasiye", "Kafe", "Telefoncu", "Spor Giyim"];

type Place = {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  image: string;
  distance: string;
  address: string;
};

type PiUser = {
  uid: string;
  username: string;
};

type PiSdk = {
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound?: (payment: unknown) => void
  ) => Promise<{
    accessToken: string;
    user: PiUser;
  }>;
};

const places: Place[] = [
  {
    id: "1",
    name: "Örnek Mağaza",
    category: "Mağazalar",
    keywords: ["mağaza", "market", "alışveriş", "kırtasiye", "spor giyim"],
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
    distance: "0,4 km",
    address: "Merkez",
  },
  {
    id: "2",
    name: "Örnek Kafe",
    category: "Restoran",
    keywords: ["kafe", "kahve", "cafe", "restoran", "çay", "tatlı"],
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
    distance: "0,7 km",
    address: "Merkez",
  },
  {
    id: "3",
    name: "Örnek Market",
    category: "Market",
    keywords: ["market", "bakkal", "gıda", "süpermarket"],
    image:
      "https://images.unsplash.com/photo-1601598851547-4302969d3f8b?auto=format&fit=crop&w=900&q=80",
    distance: "1,1 km",
    address: "Merkez",
  },
  {
    id: "4",
    name: "Örnek İkinci El",
    category: "İkinci El",
    keywords: ["ikinci el", "kullanılmış", "eşya", "satılık"],
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80",
    distance: "1,3 km",
    address: "Merkez",
  },
  {
    id: "5",
    name: "Merkez Kırtasiye",
    category: "Mağazalar",
    keywords: ["kırtasiye", "kirtasiye", "kitap", "defter", "kalem", "okul"],
    image:
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=900&q=80",
    distance: "0,8 km",
    address: "Merkez",
  },
  {
    id: "6",
    name: "Telefon Dünyası",
    category: "Elektronik",
    keywords: ["telefoncu", "telefon", "cep telefonu", "aksesuar", "şarj"],
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    distance: "1,0 km",
    address: "Merkez",
  },
  {
    id: "7",
    name: "Spor Giyim Mağazası",
    category: "Giyim",
    keywords: ["spor giyim", "eşofman", "ayakkabı", "forma", "giyim"],
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
    distance: "1,2 km",
    address: "Merkez",
  },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

function getPiSdk(): PiSdk | null {
  const runtime = globalThis as typeof globalThis & {
    Pi?: PiSdk;
  };

  return runtime.Pi ?? null;
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandLogo}>
      <View style={styles.brandLogoMark}>
        <Text style={styles.brandLogoLetter}>P</Text>
      </View>

      {!compact && <Text style={styles.brandLogoText}>Pynermap</Text>}
    </View>
  );
}

function PlaceCard({
  place,
  onPress,
  favorite,
  onFavorite,
}: {
  place: Place;
  onPress: (place: Place) => void;
  favorite: boolean;
  onFavorite: (place: Place) => void;
}) {
  return (
    <Pressable style={styles.placeCard} onPress={() => onPress(place)}>
      <Image source={{ uri: place.image }} style={styles.placeImage} />

      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeCategory}>{place.category}</Text>
        <Text style={styles.placeDistance}>{place.distance}</Text>
        <Text style={styles.placeAddress}>{place.address}</Text>
      </View>

      <Pressable
        style={styles.cardFavorite}
        onPress={(event) => {
          event.stopPropagation();
          onFavorite(place);
        }}
        hitSlop={8}
      >
        <Ionicons
          name={favorite ? "heart" : "heart-outline"}
          size={21}
          color={favorite ? "#E63946" : "#829AB1"}
        />
      </Pressable>
    </Pressable>
  );
}

function DetailScreen({
  place,
  favorite,
  onBack,
  onHome,
  onFavorite,
  onMap,
}: {
  place: Place;
  favorite: boolean;
  onBack: () => void;
  onHome: () => void;
  onFavorite: () => void;
  onMap: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.detailScreen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailScroll}
        >
          <View style={styles.detailTopBar}>
            <Pressable style={styles.detailBackButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={22} color="#102A43" />
              <Text style={styles.detailBackText}>Geri</Text>
            </Pressable>

            <Pressable style={styles.detailHomeButton} onPress={onHome}>
              <Ionicons name="home-outline" size={19} color="#1677D2" />
              <Text style={styles.detailHomeText}>Ana Sayfa</Text>
            </Pressable>
          </View>

          <Image source={{ uri: place.image }} style={styles.detailImage} />

          <View style={styles.detailBody}>
            <View style={styles.detailTitleRow}>
              <View style={styles.detailTitleWrap}>
                <Text style={styles.detailCategory}>{place.category}</Text>
                <Text style={styles.detailTitle}>{place.name}</Text>
              </View>

              <Pressable
                style={styles.detailFavoriteButton}
                onPress={onFavorite}
              >
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={24}
                  color={favorite ? "#E63946" : "#1677D2"}
                />
              </Pressable>
            </View>

            <View style={styles.detailInfoRow}>
              <Ionicons name="location-outline" size={18} color="#1677D2" />
              <Text style={styles.detailInfoText}>{place.address}</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <Ionicons name="navigate-outline" size={18} color="#1677D2" />
              <Text style={styles.detailInfoText}>{place.distance}</Text>
            </View>

            <View style={styles.detailActions}>
              <Pressable style={styles.detailPrimaryAction} onPress={onMap}>
                <Ionicons name="navigate-outline" size={19} color="#FFFFFF" />
                <Text style={styles.detailPrimaryActionText}>Yol Tarifi</Text>
              </Pressable>

              <Pressable
                style={styles.detailSecondaryAction}
                onPress={onFavorite}
              >
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={19}
                  color="#1677D2"
                />
                <Text style={styles.detailSecondaryActionText}>
                  {favorite ? "Favoride" : "Favorile"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Hakkında</Text>

              <Text style={styles.detailDescription}>
                {place.name}, Pynermap üzerinde kullanıcıların
                keşfedebilmesi için listelenen örnek bir işletme kaydıdır.
                Konum, kategori ve diğer bilgiler işletme sahibi tarafından
                güncellenebilir.
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Etiketler</Text>

              <View style={styles.detailTags}>
                {place.keywords.slice(0, 6).map((keyword) => (
                  <View key={keyword} style={styles.detailTag}>
                    <Text style={styles.detailTagText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable style={styles.fullHomeButton} onPress={onHome}>
              <Ionicons name="home-outline" size={20} color="#FFFFFF" />
              <Text style={styles.fullHomeButtonText}>Ana Sayfaya Dön</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function BottomNav({
  activeNav,
  onChange,
}: {
  activeNav: string;
  onChange: (value: string) => void;
}) {
  const items = [
    { id: "home", label: "Ana Sayfa", icon: "home-outline" },
    { id: "map", label: "Harita", icon: "map-outline" },
    { id: "add", label: "İlan Ver", icon: "add-circle-outline" },
    { id: "favorites", label: "Favoriler", icon: "heart-outline" },
    { id: "profile", label: "Hesap", icon: "person-outline" },
  ] as const;

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const active = activeNav === item.id;

        return (
          <Pressable
            key={item.id}
            style={styles.navItem}
            onPress={() => onChange(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={23}
              color={active ? "#1677D2" : "#829AB1"}
            />

            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("home");
  const [showMap, setShowMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [accountMode, setAccountMode] = useState<"login" | "register">(
    "register"
  );

  const [accountName, setAccountName] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [piLoading, setPiLoading] = useState(false);

  const [screen, setScreen] = useState<
    "home" | "add" | "favorites" | "profile"
  >("home");

  const filteredPlaces = useMemo(() => {
    const query = normalize(search.trim());

    let result = places;

    if (selectedCategory !== "Tümü") {
      result = result.filter(
        (place) => place.category === selectedCategory
      );
    }

    if (query) {
      result = result.filter((place) => {
        const searchable = normalize(
          [place.name, place.category, place.address, ...place.keywords].join(
            " "
          )
        );

        return searchable.includes(query);
      });
    }

    return [...result].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [selectedCategory, search]);

  const favoritePlaces = useMemo(
    () => places.filter((place) => favorites.includes(place.id)),
    [favorites]
  );

  const openMap = (place?: Place) => {
    const query = place
      ? encodeURIComponent(`${place.name}, ${place.address}`)
      : encodeURIComponent("Pynermap");

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`
    );
  };

  const goHome = () => {
    setActiveNav("home");
    setScreen("home");
    setShowMap(false);
    setSelectedPlace(null);
    setSelectedCategory("Tümü");
    setSearch("");
  };

  const openDetail = (place: Place) => setSelectedPlace(place);

  const toggleFavorite = (place: Place) => {
    setFavorites((current) =>
      current.includes(place.id)
        ? current.filter((id) => id !== place.id)
        : [...current, place.id]
    );
  };

  const selectQuickSearch = (value: string) => {
    setSearch(value);
    setSelectedCategory("Tümü");
    setActiveNav("home");
    setScreen("home");
    setShowMap(false);
    setSelectedPlace(null);
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setSearch("");
    setActiveNav("home");
    setScreen("home");
    setShowMap(false);
    setSelectedPlace(null);
  };

  const handleNav = (value: string) => {
    setActiveNav(value);

    if (value === "home") {
      goHome();
      return;
    }

    setSelectedPlace(null);

    if (value === "map") {
      setScreen("home");
      setShowMap(true);
      return;
    }

    setShowMap(false);

    if (value === "add") setScreen("add");
    if (value === "favorites") setScreen("favorites");
    if (value === "profile") setScreen("profile");
  };

  const loginWithPi = async () => {
    if (piLoading) return;

    setPiLoading(true);

    try {
      const Pi = getPiSdk();

      if (!Pi?.authenticate) {
        Alert.alert(
          "P ile Giriş",
          "Pi giriş sistemi Pi SDK'nın bulunduğu Pi Browser ortamında kullanılabilir. Uygulamayı Pi Browser içinde açarak tekrar deneyebilirsin."
        );
        return;
      }

      const auth = await Pi.authenticate(
        ["username"],
        (payment) => {
          console.log("Tamamlanmamış Pi ödemesi:", payment);
        }
      );

      if (auth?.user) {
        setPiUser(auth.user);

        Alert.alert(
          "Pynermap",
          `Hoş geldin @${auth.user.username || "Pynermap kullanıcısı"}!`
        );
      }
    } catch (error) {
      console.error("Pi giriş hatası:", error);

      Alert.alert(
        "P ile Giriş",
        "Pi hesabıyla giriş yapılamadı. Lütfen Pi Browser içinde tekrar dene."
      );
    } finally {
      setPiLoading(false);
    }
  };

  if (selectedPlace) {
    return (
      <DetailScreen
        place={selectedPlace}
        favorite={favorites.includes(selectedPlace.id)}
        onBack={() => setSelectedPlace(null)}
        onHome={goHome}
        onFavorite={() => toggleFavorite(selectedPlace)}
        onMap={() => openMap(selectedPlace)}
      />
    );
  }

  if (screen === "add") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.simpleScreen}>
          <View style={styles.simpleHeader}>
            <Pressable style={styles.simpleBack} onPress={goHome}>
              <Ionicons name="arrow-back" size={22} color="#102A43" />
            </Pressable>

            <Text style={styles.simpleTitle}>İlan Ver</Text>
          </View>

          <View style={styles.simpleContent}>
            <View style={styles.simpleIcon}>
              <Ionicons
                name="add-circle-outline"
                size={42}
                color="#1677D2"
              />
            </View>

            <Text style={styles.simpleMainTitle}>
              Ne eklemek istiyorsun?
            </Text>

            <Text style={styles.simpleText}>
              Mağaza, ürün, hizmet veya ikinci el ilanını Pynermap'a eklemek
              için buradan başlayabilirsin.
            </Text>

            {[
              ["storefront-outline", "Mağaza Ekle"],
              ["pricetag-outline", "Ürün Ekle"],
              ["construct-outline", "Hizmet Ekle"],
              ["repeat-outline", "İkinci El İlanı"],
            ].map(([icon, label]) => (
              <Pressable key={label} style={styles.actionRow}>
                <Ionicons
                  name={icon as any}
                  size={22}
                  color="#1677D2"
                />

                <Text style={styles.actionRowText}>{label}</Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#829AB1"
                />
              </Pressable>
            ))}
          </View>

          <BottomNav activeNav="add" onChange={handleNav} />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "favorites") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.simpleScreen}>
          <View style={styles.simpleHeader}>
            <Pressable style={styles.simpleBack} onPress={goHome}>
              <Ionicons name="arrow-back" size={22} color="#102A43" />
            </Pressable>

            <Text style={styles.simpleTitle}>Favoriler</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.simpleScroll}
          >
            {favoritePlaces.length > 0 ? (
              <View style={styles.placesList}>
                {favoritePlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onPress={openDetail}
                    favorite
                    onFavorite={toggleFavorite}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="heart-outline"
                  size={38}
                  color="#829AB1"
                />

                <Text style={styles.emptyTitle}>Henüz favorin yok</Text>

                <Text style={styles.emptyText}>
                  Beğendiğin yerleri kalp simgesine dokunarak kaydedebilirsin.
                </Text>
              </View>
            )}

            <Pressable style={styles.fullHomeButton} onPress={goHome}>
              <Ionicons name="home-outline" size={20} color="#FFFFFF" />
              <Text style={styles.fullHomeButtonText}>
                Ana Sayfaya Dön
              </Text>
            </Pressable>
          </ScrollView>

          <BottomNav activeNav="favorites" onChange={handleNav} />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "profile") {
    const submitAccount = () => {
      if (accountMode === "register") {
        if (
          !accountName.trim() ||
          !accountUsername.trim() ||
          !accountEmail.trim() ||
          !accountPassword ||
          !accountPasswordConfirm
        ) {
          Alert.alert(
            "Eksik bilgi",
            "Lütfen zorunlu alanların tamamını doldur."
          );
          return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(accountEmail.trim())) {
          Alert.alert(
            "Geçersiz e-posta",
            "Lütfen geçerli bir e-posta adresi gir."
          );
          return;
        }

        if (accountPassword.length < 6) {
          Alert.alert(
            "Şifre çok kısa",
            "Şifren en az 6 karakter olmalı."
          );
          return;
        }

        if (accountPassword !== accountPasswordConfirm) {
          Alert.alert(
            "Şifreler eşleşmiyor",
            "Şifre ve şifre tekrar alanlarını kontrol et."
          );
          return;
        }

        if (!termsAccepted || !privacyAccepted) {
          Alert.alert(
            "Onay gerekli",
            "Hesap oluşturmak için Kullanım Şartları ve Gizlilik Politikası'nı kabul etmelisin."
          );
          return;
        }

        Alert.alert(
          "Kayıt bilgileri hazır",
          "Form başarıyla doğrulandı. Kalıcı hesap oluşturmak için gerçek kimlik doğrulama servisi bağlanması gerekiyor."
        );

        return;
      }

      if (!accountEmail.trim() || !accountPassword) {
        Alert.alert("Eksik bilgi", "E-posta ve şifre gerekli.");
        return;
      }

      Alert.alert(
        "Giriş bilgileri hazır",
        "Bilgilerin doğrulandı. Kalıcı giriş için gerçek kimlik doğrulama servisi bağlanması gerekiyor."
      );
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.simpleScreen}>
          <View style={styles.simpleHeader}>
            <Pressable style={styles.simpleBack} onPress={goHome}>
              <Ionicons name="arrow-back" size={22} color="#102A43" />
            </Pressable>

            <Text style={styles.simpleTitle}>Hesap</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.accountScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.profileAvatar}>
              <Ionicons
                name="person-outline"
                size={38}
                color="#1677D2"
              />
            </View>

            <Text style={styles.simpleMainTitle}>
              Pynermap Hesabın
            </Text>

            <Text style={styles.simpleText}>
              İlanlarını, favorilerini ve profil bilgilerini hesabından yönet.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.piLoginButton,
                pressed && styles.accountSubmitButtonPressed,
                piLoading && styles.piLoginButtonDisabled,
              ]}
              onPress={loginWithPi}
              disabled={piLoading}
            >
              <View style={styles.piLoginMark}>
                <Text style={styles.piLoginMarkText}>P</Text>
              </View>

              <View style={styles.piLoginTextWrap}>
                <Text style={styles.piLoginTitle}>
                  {piLoading
                    ? "Pi ile giriş yapılıyor..."
                    : "P ile Giriş"}
                </Text>

                <Text style={styles.piLoginSubtitle}>
                  Pi hesabınla Pynermap'a giriş yap
                </Text>
              </View>

              <Ionicons
                name={piLoading ? "sync-outline" : "chevron-forward"}
                size={20}
                color="#1677D2"
              />
            </Pressable>

            {piUser && (
              <View style={styles.piUserCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color="#19A974"
                />

                <Text style={styles.piUserText}>
                  @{piUser.username} · Pi hesabıyla giriş yapıldı
                </Text>
              </View>
            )}

            <View style={styles.accountModeRow}>
              <Pressable
                style={[
                  styles.accountModeButton,
                  accountMode === "register" &&
                    styles.accountModeButtonActive,
                ]}
                onPress={() => setAccountMode("register")}
              >
                <Text
                  style={[
                    styles.accountModeText,
                    accountMode === "register" &&
                      styles.accountModeTextActive,
                  ]}
                >
                  Kayıt Ol
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.accountModeButton,
                  accountMode === "login" &&
                    styles.accountModeButtonActive,
                ]}
                onPress={() => setAccountMode("login")}
              >
                <Text
                  style={[
                    styles.accountModeText,
                    accountMode === "login" &&
                      styles.accountModeTextActive,
                  ]}
                >
                  Giriş Yap
                </Text>
              </Pressable>
            </View>

            {accountMode === "register" && (
              <>
                <TextInput
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#829AB1"
                  style={styles.accountInput}
                />

                <TextInput
                  value={accountUsername}
                  onChangeText={setAccountUsername}
                  placeholder="Kullanıcı adı"
                  placeholderTextColor="#829AB1"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.accountInput}
                />
              </>
            )}

            <TextInput
              value={accountEmail}
              onChangeText={setAccountEmail}
              placeholder="E-posta adresi"
              placeholderTextColor="#829AB1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.accountInput}
            />

            <View style={styles.passwordInputWrap}>
              <TextInput
                value={accountPassword}
                onChangeText={setAccountPassword}
                placeholder="Şifre"
                placeholderTextColor="#829AB1"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={styles.passwordEyeButton}
                onPress={() => setShowPassword((value) => !value)}
                hitSlop={8}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color="#52606D"
                />
              </Pressable>
            </View>

            {accountMode === "register" && (
              <View style={styles.passwordInputWrap}>
                <TextInput
                  value={accountPasswordConfirm}
                  onChangeText={setAccountPasswordConfirm}
                  placeholder="Şifre tekrar"
                  placeholderTextColor="#829AB1"
                  secureTextEntry={!showPasswordConfirm}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Pressable
                  style={styles.passwordEyeButton}
                  onPress={() =>
                    setShowPasswordConfirm((value) => !value)
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showPasswordConfirm
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={21}
                    color="#52606D"
                  />
                </Pressable>
              </View>
            )}

            {accountMode === "register" && (
              <View style={styles.accountChecks}>
                <Pressable
                  style={styles.checkRow}
                  onPress={() => setTermsAccepted((value) => !value)}
                >
                  <Ionicons
                    name={
                      termsAccepted
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color={
                      termsAccepted
                        ? "#1677D2"
                        : "#829AB1"
                    }
                  />

                  <Text style={styles.checkText}>
                    <Text
                      style={styles.checkLink}
                      onPress={() =>
                        Alert.alert(
                          "Kullanım Şartları",
                          "Pynermap kullanım şartları sonraki aşamada ayrıntılı metin olarak eklenecek."
                        )
                      }
                    >
                      Kullanım Şartları
                    </Text>

                    {"'nı kabul ediyorum."}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.checkRow}
                  onPress={() =>
                    setPrivacyAccepted((value) => !value)
                  }
                >
                  <Ionicons
                    name={
                      privacyAccepted
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color={
                      privacyAccepted
                        ? "#1677D2"
                        : "#829AB1"
                    }
                  />

                  <Text style={styles.checkText}>
                    <Text
                      style={styles.checkLink}
                      onPress={() =>
                        Alert.alert(
                          "Gizlilik Politikası",
                          "Pynermap gizlilik politikası sonraki aşamada ayrıntılı metin olarak eklenecek."
                        )
                      }
                    >
                      Gizlilik Politikası
                    </Text>

                    {"'nı kabul ediyorum."}
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.accountSubmitButton,
                pressed && styles.accountSubmitButtonPressed,
              ]}
              onPress={submitAccount}
              android_ripple={{ color: "#0F5EAA" }}
            >
              <Text style={styles.accountSubmitText}>
                {accountMode === "register"
                  ? "Hesap Oluştur"
                  : "Giriş Yap"}
              </Text>
            </Pressable>

            {accountMode === "login" && (
              <Pressable
                style={styles.forgotPasswordButton}
                onPress={() =>
                  Alert.alert(
                    "Şifremi Unuttum",
                    "Şifre sıfırlama e-postası gerçek kimlik doğrulama sistemi bağlandığında gönderilecek."
                  )
                }
              >
                <Text style={styles.forgotPasswordText}>
                  Şifremi Unuttum
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.fullHomeButton}
              onPress={goHome}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.fullHomeButtonText}>
                Ana Sayfaya Dön
              </Text>
            </Pressable>
          </ScrollView>

          <BottomNav
            activeNav="profile"
            onChange={handleNav}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (showMap) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mapScreen}>
          <View style={styles.mapHeader}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                setShowMap(false);
                setActiveNav("home");
                setScreen("home");
              }}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#102A43"
              />
            </Pressable>

            <View>
              <Text style={styles.mapTitle}>
                Pynermap Yerleri
              </Text>

              <Text style={styles.mapSubtitle}>
                Yaklaşık konum
              </Text>
            </View>

            <Pressable
              style={styles.mapExternalButton}
              onPress={() => openMap()}
            >
              <Ionicons
                name="navigate-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.mapExternalText}>
                Haritada Aç
              </Text>
            </Pressable>
          </View>

          <View style={styles.mapPlaceholder}>
            <View style={styles.mapRoadHorizontal} />
            <View style={styles.mapRoadVertical} />
            <View style={styles.mapBlockOne} />
            <View style={styles.mapBlockTwo} />
            <View style={styles.mapBlockThree} />

            <View
              style={[
                styles.mapPin,
                { top: "30%", left: "30%" },
              ]}
            >
              <Ionicons
                name="location"
                size={34}
                color="#1677D2"
              />
            </View>

            <View
              style={[
                styles.mapPin,
                { top: "52%", left: "58%" },
              ]}
            >
              <Ionicons
                name="location"
                size={34}
                color="#FF6B35"
              />
            </View>

            <View
              style={[
                styles.mapPin,
                { top: "65%", left: "25%" },
              ]}
            >
              <Ionicons
                name="location"
                size={34}
                color="#19A974"
              />
            </View>

            <View style={styles.approximateLocation}>
              <View style={styles.locationDot} />

              <Text style={styles.approximateText}>
                Yaklaşık konum
              </Text>
            </View>

            <View style={styles.mapNotice}>
              <Ionicons
                name="map-outline"
                size={18}
                color="#52606D"
              />

              <Text style={styles.mapNoticeText}>
                Gerçek harita bağlantısı sonraki aşamada eklenecek.
              </Text>
            </View>
          </View>

          <View style={styles.mapResults}>
            <View style={styles.mapResultsHeader}>
              <Text style={styles.sectionTitle}>
                {filteredPlaces.length} yer bulundu
              </Text>

              <Pressable
                style={styles.listReturnButton}
                onPress={() => {
                  setShowMap(false);
                  setActiveNav("home");
                  setScreen("home");
                }}
              >
                <Ionicons
                  name="list-outline"
                  size={18}
                  color="#1677D2"
                />

                <Text style={styles.listReturnText}>
                  Listeye Dön
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalPlaces}
            >
              {filteredPlaces.map((place) => (
                <Pressable
                  key={place.id}
                  style={styles.mapPlaceMiniCard}
                  onPress={() => {
                    setShowMap(false);
                    openDetail(place);
                  }}
                >
                  <Image
                    source={{ uri: place.image }}
                    style={styles.mapMiniImage}
                  />

                  <Text
                    style={styles.mapMiniName}
                    numberOfLines={1}
                  >
                    {place.name}
                  </Text>

                  <Text style={styles.mapMiniDistance}>
                    {place.distance}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <BottomNav
            activeNav="map"
            onChange={handleNav}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <BrandLogo />

            <Pressable
              style={styles.languageButton}
              onPress={() =>
                Alert.alert(
                  "Dil",
                  "Dil seçimi çoklu dil aşamasında etkinleştirilecek."
                )
              }
            >
              <Text style={styles.flag}>🇹🇷</Text>

              <Text style={styles.languageText}>
                TR
              </Text>

              <Ionicons
                name="chevron-down"
                size={15}
                color="#52606D"
              />
            </Pressable>
          </View>

          <Pressable
            style={styles.locationBar}
            onPress={() => openMap()}
          >
            <View style={styles.locationIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#1677D2"
              />
            </View>

            <View style={styles.locationTextWrap}>
              <Text style={styles.locationLabel}>
                Konum
              </Text>

              <Text style={styles.locationValue}>
                Pynermap'taki yerleri keşfet
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#829AB1"
            />
          </Pressable>

          <View style={styles.searchPanel}>
            <View style={styles.searchIconCircle}>
              <Ionicons
                name="search-outline"
                size={21}
                color="#1677D2"
              />
            </View>

            <View style={styles.searchInputWrap}>
              <Text style={styles.searchSmallLabel}>
                PYNermap'TA ARA
              </Text>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Ne arıyorsun?"
                placeholderTextColor="#829AB1"
                style={styles.searchInput}
                returnKeyType="search"
              />
            </View>

            {search.length > 0 && (
              <Pressable
                style={styles.searchClearButton}
                onPress={() => setSearch("")}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color="#52606D"
                />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => selectCategory(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category &&
                    styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.discoveryHero}>
            <View style={styles.discoveryGlow} />

            <Pressable
              style={[
                styles.discoveryCategory,
                styles.discoveryCategoryTopLeft,
              ]}
              onPress={() => selectCategory("Mağazalar")}
            >
              <View style={styles.discoveryCategoryIcon}>
                <Ionicons
                  name="storefront-outline"
                  size={22}
                  color="#1677D2"
                />
              </View>

              <Text style={styles.discoveryCategoryText}>
                Mağaza
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.discoveryCategory,
                styles.discoveryCategoryTopRight,
              ]}
              onPress={() => selectCategory("Market")}
            >
              <View style={styles.discoveryCategoryIcon}>
                <Ionicons
                  name="cart-outline"
                  size={22}
                  color="#19A974"
                />
              </View>

              <Text style={styles.discoveryCategoryText}>
                Market
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.discoveryCategory,
                styles.discoveryCategoryLeft,
              ]}
              onPress={() => selectCategory("Restoran")}
            >
              <View style={styles.discoveryCategoryIcon}>
                <Ionicons
                  name="restaurant-outline"
                  size={22}
                  color="#FF6B35"
                />
              </View>

              <Text style={styles.discoveryCategoryText}>
                Restoran
              </Text>
            </Pressable>

            <Pressable
              style={styles.discoveryBrand}
              onPress={() => selectCategory("Tümü")}
            >
              <View style={styles.discoveryBrandMark}>
                <Text style={styles.discoveryBrandY}>
                  P
                </Text>
              </View>

              <Text style={styles.discoveryBrandName}>
                Pynermap
              </Text>

              <Text style={styles.discoveryBrandHint}>
                Her şey Pynermap'ta
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.discoveryCategory,
                styles.discoveryCategoryRight,
              ]}
              onPress={() => selectCategory("Giyim")}
            >
              <View style={styles.discoveryCategoryIcon}>
                <Ionicons
                  name="shirt-outline"
                  size={22}
                  color="#7C3AED"
                />
              </View>

              <Text style={styles.discoveryCategoryText}>
                Giyim
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.discoveryCategory,
                styles.discoveryCategoryBottomLeft,
              ]}
              onPress={() => selectCategory("Hizmetler")}
            >
              <View style={styles.discoveryCategoryIcon}>
                <Ionicons
                  name="construct-outline"
                  size={22}
                  color="#1677D2"
                />
              </View>

              <Text style={styles.discoveryCategoryText}>
                Hizmet
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.discoveryCategory,
                styles.discoveryCategoryBottomRight,
              ]}
              onPress={() => selectCategory("İkinci El")}
            >
              <View style={styles.discoveryCategoryIcon}>
                <Ionicons
                  name="repeat-outline"
                  size={22}
                  color="#E63946"
                />
              </View>

              <Text style={styles.discoveryCategoryText}>
                İkinci El
              </Text>
            </Pressable>

            <View style={styles.discoveryBottom}>
              <Text style={styles.discoveryResult}>
                {filteredPlaces.length} yer bulundu
              </Text>

              <Pressable
                style={styles.discoveryMapButton}
                onPress={() => {
                  setActiveNav("map");
                  setShowMap(true);
                }}
              >
                <Ionicons
                  name="map-outline"
                  size={17}
                  color="#FFFFFF"
                />

                <Text style={styles.discoveryMapText}>
                  Haritayı Aç
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Yakınındaki Yerler
            </Text>

            <Pressable
              onPress={() => {
                setSearch("");
                setSelectedCategory("Tümü");
              }}
            >
              <Text style={styles.seeAllText}>
                Tümünü Gör
              </Text>
            </Pressable>
          </View>

          <View style={styles.placesList}>
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onPress={openDetail}
                favorite={favorites.includes(place.id)}
                onFavorite={toggleFavorite}
              />
            ))}
          </View>

          {filteredPlaces.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={34}
                color="#829AB1"
              />

              <Text style={styles.emptyTitle}>
                Sonuç bulunamadı
              </Text>

              <Text style={styles.emptyText}>
                Farklı bir arama veya kategori deneyebilirsin.
              </Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Hızlı Erişim
            </Text>
          </View>

          <View style={styles.quickGrid}>
            {quickPlaces.map((place) => (
              <Pressable
                key={place}
                style={styles.quickCard}
                onPress={() => selectQuickSearch(place)}
              >
                <View style={styles.quickIcon}>
                  <Ionicons
                    name={
                      place === "Kırtasiye"
                        ? "book-outline"
                        : place === "Kafe"
                        ? "cafe-outline"
                        : place === "Telefoncu"
                        ? "phone-portrait-outline"
                        : "shirt-outline"
                    }
                    size={19}
                    color="#1677D2"
                  />
                </View>

                <Text style={styles.quickText}>
                  {place}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.businessBanner}
            onPress={() => handleNav("add")}
          >
            <View style={styles.businessIcon}>
              <Ionicons
                name="storefront"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.businessTextWrap}>
              <Text style={styles.businessTitle}>
                İşletmeni Pynermap'ta Öne Çıkar!
              </Text>

              <Text style={styles.businessDescription}>
                Müşterilerin seni yakından bulsun.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </ScrollView>

        <BottomNav
          activeNav={activeNav}
          onChange={handleNav}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  header: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  brandLogoMark: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1677D2",
  },

  brandLogoLetter: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  brandLogoText: {
    color: "#102A43",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    borderRadius: 12,
  },

  flag: {
    fontSize: 17,
  },

  languageText: {
    color: "#102A43",
    fontSize: 13,
    fontWeight: "800",
  },

  locationBar: {
    minHeight: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E6F2",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  locationTextWrap: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 11,
    color: "#829AB1",
    fontWeight: "700",
    marginBottom: 2,
  },

  locationValue: {
    color: "#102A43",
    fontSize: 14,
    fontWeight: "700",
  },

  searchPanel: {
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D9E6F2",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  searchIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  searchInputWrap: {
    flex: 1,
    marginLeft: 11,
  },

  searchSmallLabel: {
    color: "#829AB1",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },

  searchInput: {
    color: "#102A43",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 2,
  },

  searchClearButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F5FAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryScroll: {
    gap: 8,
    paddingBottom: 16,
  },

  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
  },

  categoryChipActive: {
    backgroundColor: "#1677D2",
    borderColor: "#1677D2",
  },

  categoryText: {
    color: "#52606D",
    fontSize: 13,
    fontWeight: "700",
  },

  categoryTextActive: {
    color: "#FFFFFF",
  },

  discoveryHero: {
    height: 410,
    borderRadius: 30,
    backgroundColor: "#EAF4FF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    position: "relative",
    overflow: "hidden",
    marginBottom: 24,
  },

  discoveryGlow: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
    alignSelf: "center",
    top: 58,
  },

  discoveryBrand: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    top: 96,
    borderWidth: 1,
    borderColor: "#D9E6F2",
    shadowColor: "#102A43",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 5,
  },

  discoveryBrandMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#1677D2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  discoveryBrandY: {
    color: "#FFFFFF",
    fontSize: 37,
    fontWeight: "900",
  },

  discoveryBrandName: {
    color: "#102A43",
    fontSize: 17,
    fontWeight: "900",
  },

  discoveryBrandHint: {
    color: "#829AB1",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },

  discoveryCategory: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    shadowColor: "#102A43",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  discoveryCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "#F5FAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  discoveryCategoryText: {
    color: "#102A43",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
  },

  discoveryCategoryTopLeft: {
    left: 38,
    top: 52,
  },

  discoveryCategoryTopRight: {
    right: 38,
    top: 52,
  },

  discoveryCategoryLeft: {
    left: 12,
    top: 164,
  },

  discoveryCategoryRight: {
    right: 12,
    top: 164,
  },

  discoveryCategoryBottomLeft: {
    left: 53,
    top: 270,
  },

  discoveryCategoryBottomRight: {
    right: 53,
    top: 270,
  },

  discoveryBottom: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  discoveryResult: {
    color: "#52606D",
    fontSize: 12,
    fontWeight: "800",
  },

  discoveryMapButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#1677D2",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  discoveryMapText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#102A43",
    fontSize: 18,
    fontWeight: "900",
  },

  seeAllText: {
    color: "#1677D2",
    fontSize: 13,
    fontWeight: "800",
  },

  placesList: {
    gap: 10,
    marginBottom: 24,
  },

  placeCard: {
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E6F2",
    padding: 10,
    flexDirection: "row",
    position: "relative",
  },

  placeImage: {
    width: 92,
    height: 85,
    borderRadius: 14,
    backgroundColor: "#EAF4FF",
  },

  placeInfo: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 30,
    justifyContent: "center",
  },

  placeName: {
    color: "#102A43",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },

  placeCategory: {
    color: "#1677D2",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 3,
  },

  placeDistance: {
    color: "#52606D",
    fontSize: 12,
    fontWeight: "700",
  },

  placeAddress: {
    color: "#829AB1",
    fontSize: 11,
    marginTop: 2,
  },

  cardFavorite: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F5FAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E6F2",
    padding: 28,
    marginBottom: 24,
  },

  emptyTitle: {
    color: "#102A43",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyText: {
    color: "#829AB1",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },

  quickCard: {
    width: "48.5%",
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  quickIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  quickText: {
    color: "#102A43",
    fontSize: 13,
    fontWeight: "800",
  },

  businessBanner: {
    minHeight: 88,
    borderRadius: 21,
    backgroundColor: "#1677D2",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  businessIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  businessTextWrap: {
    flex: 1,
  },

  businessTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  businessDescription: {
    color: "#DDEEFF",
    fontSize: 12,
    marginTop: 4,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#D9E6F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 7,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  navLabel: {
    color: "#829AB1",
    fontSize: 10,
    fontWeight: "700",
  },

  navLabelActive: {
    color: "#1677D2",
    fontWeight: "900",
  },

  mapScreen: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  mapHeader: {
    minHeight: 72,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D9E6F2",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  mapTitle: {
    color: "#102A43",
    fontSize: 15,
    fontWeight: "900",
  },

  mapSubtitle: {
    color: "#829AB1",
    fontSize: 11,
    marginTop: 2,
  },

  mapExternalButton: {
    marginLeft: "auto",
    minHeight: 40,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#1677D2",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  mapExternalText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  mapPlaceholder: {
    flex: 1,
    minHeight: 330,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#E9F0E8",
  },

  mapRoadHorizontal: {
    position: "absolute",
    left: -20,
    right: -20,
    top: "48%",
    height: 54,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-7deg" }],
  },

  mapRoadVertical: {
    position: "absolute",
    width: 55,
    top: -40,
    bottom: -40,
    left: "42%",
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "17deg" }],
  },

  mapBlockOne: {
    position: "absolute",
    width: 100,
    height: 85,
    top: "15%",
    left: "7%",
    backgroundColor: "#DDE7D9",
    borderRadius: 12,
  },

  mapBlockTwo: {
    position: "absolute",
    width: 120,
    height: 100,
    top: "57%",
    right: "6%",
    backgroundColor: "#D7E2D3",
    borderRadius: 12,
  },

  mapBlockThree: {
    position: "absolute",
    width: 90,
    height: 100,
    top: "18%",
    right: "8%",
    backgroundColor: "#E1E9DD",
    borderRadius: 12,
  },

  mapPin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  approximateLocation: {
    position: "absolute",
    left: 15,
    bottom: 15,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    shadowColor: "#102A43",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  locationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#1677D2",
  },

  approximateText: {
    color: "#52606D",
    fontSize: 11,
    fontWeight: "800",
  },

  mapNotice: {
    position: "absolute",
    left: 15,
    right: 15,
    top: 15,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.94)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  mapNoticeText: {
    flex: 1,
    color: "#52606D",
    fontSize: 11,
    fontWeight: "700",
  },

  mapResults: {
    backgroundColor: "#FFFFFF",
    paddingTop: 14,
    paddingBottom: 85,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -16,
  },

  mapResultsHeader: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  listReturnButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: "#EAF4FF",
  },

  listReturnText: {
    color: "#1677D2",
    fontSize: 11,
    fontWeight: "900",
  },

  horizontalPlaces: {
    paddingHorizontal: 15,
    gap: 10,
  },

  mapPlaceMiniCard: {
    width: 145,
    backgroundColor: "#F5FAFF",
    borderRadius: 14,
    padding: 7,
    borderWidth: 1,
    borderColor: "#D9E6F2",
  },

  mapMiniImage: {
    width: "100%",
    height: 68,
    borderRadius: 10,
    backgroundColor: "#EAF4FF",
  },

  mapMiniName: {
    color: "#102A43",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6,
  },

  mapMiniDistance: {
    color: "#829AB1",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },

  detailScreen: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  detailScroll: {
    paddingBottom: 30,
  },

  detailTopBar: {
    minHeight: 64,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D9E6F2",
  },

  detailBackButton: {
    minHeight: 42,
    paddingHorizontal: 11,
    borderRadius: 13,
    backgroundColor: "#EAF4FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  detailBackText: {
    color: "#102A43",
    fontSize: 13,
    fontWeight: "900",
  },

  detailHomeButton: {
    minHeight: 42,
    paddingHorizontal: 11,
    borderRadius: 13,
    backgroundColor: "#EAF4FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  detailHomeText: {
    color: "#1677D2",
    fontSize: 13,
    fontWeight: "900",
  },

  detailImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#EAF4FF",
  },

  detailBody: {
    padding: 18,
  },

  detailTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  detailTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },

  detailCategory: {
    color: "#1677D2",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },

  detailTitle: {
    color: "#102A43",
    fontSize: 27,
    fontWeight: "900",
  },

  detailFavoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    alignItems: "center",
    justifyContent: "center",
  },

  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    gap: 8,
  },

  detailInfoText: {
    color: "#52606D",
    fontSize: 14,
    fontWeight: "700",
  },

  detailActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  detailPrimaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: "#1677D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  detailPrimaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  detailSecondaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  detailSecondaryActionText: {
    color: "#1677D2",
    fontSize: 13,
    fontWeight: "900",
  },

  detailSection: {
    marginTop: 25,
  },

  detailSectionTitle: {
    color: "#102A43",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 9,
  },

  detailDescription: {
    color: "#52606D",
    fontSize: 14,
    lineHeight: 21,
  },

  detailTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  detailTag: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EAF4FF",
  },

  detailTagText: {
    color: "#1677D2",
    fontSize: 11,
    fontWeight: "800",
  },

  fullHomeButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: "#1677D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 25,
  },

  fullHomeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  simpleScreen: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  simpleHeader: {
    minHeight: 68,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D9E6F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  simpleBack: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  simpleTitle: {
    color: "#102A43",
    fontSize: 19,
    fontWeight: "900",
  },

  accountScroll: {
    padding: 20,
    paddingBottom: 120,
  },

  accountModeRow: {
    flexDirection: "row",
    backgroundColor: "#EAF4FF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },

  accountModeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  accountModeButtonActive: {
    backgroundColor: "#FFFFFF",
  },

  accountModeText: {
    color: "#52606D",
    fontSize: 14,
    fontWeight: "800",
  },

  accountModeTextActive: {
    color: "#1677D2",
  },

  piLoginButton: {
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    borderRadius: 17,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  piLoginButtonDisabled: {
    opacity: 0.65,
  },

  piLoginMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#1677D2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  piLoginMarkText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  piLoginTextWrap: {
    flex: 1,
  },

  piLoginTitle: {
    color: "#102A43",
    fontSize: 15,
    fontWeight: "900",
  },

  piLoginSubtitle: {
    color: "#829AB1",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  piUserCard: {
    minHeight: 44,
    backgroundColor: "#EAF8F1",
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 7,
  },

  piUserText: {
    flex: 1,
    color: "#18794E",
    fontSize: 12,
    fontWeight: "800",
  },

  accountInput: {
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    borderRadius: 15,
    paddingHorizontal: 16,
    color: "#102A43",
    fontSize: 15,
    marginBottom: 10,
  },

  passwordInputWrap: {
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingRight: 8,
    color: "#102A43",
    fontSize: 15,
  },

  passwordEyeButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },

  accountChecks: {
    marginTop: 4,
    marginBottom: 14,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  checkText: {
    flex: 1,
    marginLeft: 9,
    color: "#52606D",
    fontSize: 13,
    lineHeight: 20,
  },

  checkLink: {
    color: "#1677D2",
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  accountSubmitButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#1677D2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  accountSubmitButtonPressed: {
    opacity: 0.82,
  },

  accountSubmitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  forgotPasswordButton: {
    alignItems: "center",
    paddingVertical: 14,
  },

  forgotPasswordText: {
    color: "#1677D2",
    fontSize: 13,
    fontWeight: "800",
  },

  simpleContent: {
    padding: 18,
  },

  simpleScroll: {
    padding: 18,
    paddingBottom: 110,
  },

  simpleIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
  },

  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
  },

  simpleMainTitle: {
    color: "#102A43",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
  },

  simpleText: {
    color: "#52606D",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  actionRow: {
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6F2",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  actionRowText: {
    flex: 1,
    color: "#102A43",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 11,
  },
});
