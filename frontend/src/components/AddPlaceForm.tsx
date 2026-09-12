import React, { type ChangeEvent } from "react";

export type AddPlaceFormLabels = {
  title?: string;
  name?: string;
  namePlaceholder?: string;
  category?: string;
  categoryPlaceholder?: string;
  description?: string;
  descriptionPlaceholder?: string;
  language?: string;
  languagePlaceholder?: string;
  country?: string;
  countryPlaceholder?: string;
  photo?: string;
  photoPreparing?: string;
  removePhoto?: string;
  selectedPhotoAlt?: string;
  location?: string;
  chooseLocation?: string;
  chooseLocationFromMap?: string;
  saving?: string;
  savePlace?: string;
  invalidImage?: string;
  imageTooLarge?: string;
};

type AddPlaceFormProps = {
  placeName: string;
  setPlaceName: (value: string) => void;
  placeDescription: string;
  setPlaceDescription: (value: string) => void;
  placeCategory: string;
  setPlaceCategory: (value: string) => void;
  placeLanguage: string;
  setPlaceLanguage: (value: string) => void;
  placeCountry: string;
  setPlaceCountry: (value: string) => void;
  categories: string[];
  languages: Array<string | { value: string; label: string }>;
  countries: Array<string | { value: string; label: string }>;
  selectedLocation?: { lat: number; lng: number } | null;
  onMapSelect?: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitting?: boolean;
  placeImage?: string;
  setPlaceImage?: (value: string) => void;
  imageUploading?: boolean;
  labels?: AddPlaceFormLabels;
};

const getOptionValue = (
  item: string | { value: string; label: string }
) => (typeof item === "string" ? item : item.value);

const getOptionLabel = (
  item: string | { value: string; label: string }
) => (typeof item === "string" ? item : item.label);

const AddPlaceForm: React.FC<AddPlaceFormProps> = ({
  placeName,
  setPlaceName,
  placeDescription,
  setPlaceDescription,
  placeCategory,
  setPlaceCategory,
  placeLanguage,
  setPlaceLanguage,
  placeCountry,
  setPlaceCountry,
  categories,
  languages,
  countries,
  selectedLocation,
  onMapSelect,
  onSubmit,
  onCancel,
  submitting = false,
  placeImage = "",
  setPlaceImage,
  imageUploading = false,
  labels = {},
}) => {
  const t = {
    title: labels.title ?? "Yeni Yer Ekle",
    name: labels.name ?? "Ä°ÅŸletme / Yer AdÄ±",
    namePlaceholder: labels.namePlaceholder ?? "Ã–rn: Dilek's Home",
    category: labels.category ?? "Kategori",
    categoryPlaceholder: labels.categoryPlaceholder ?? "Kategori seÃ§in",
    description: labels.description ?? "AÃ§Ä±klama",
    descriptionPlaceholder:
      labels.descriptionPlaceholder ?? "Yer hakkÄ±nda kÄ±sa bilgi...",
    language: labels.language ?? "Dil",
    languagePlaceholder: labels.languagePlaceholder ?? "Dil seÃ§in",
    country: labels.country ?? "Ãœlke",
    countryPlaceholder: labels.countryPlaceholder ?? "Ãœlke seÃ§in",
    photo: labels.photo ?? "FotoÄŸraf",
    photoPreparing:
      labels.photoPreparing ?? "FotoÄŸraf hazÄ±rlanÄ±yor...",
    removePhoto: labels.removePhoto ?? "FotoÄŸrafÄ± KaldÄ±r",
    selectedPhotoAlt: labels.selectedPhotoAlt ?? "SeÃ§ilen fotoÄŸraf",
    location: labels.location ?? "Konum",
    chooseLocation:
      labels.chooseLocation ?? "Haritadan bir konum seÃ§in.",
    chooseLocationFromMap:
      labels.chooseLocationFromMap ?? "Haritadan Konum SeÃ§",
    saving: labels.saving ?? "Kaydediliyor...",
    savePlace: labels.savePlace ?? "Yeri Kaydet",
    invalidImage:
      labels.invalidImage ?? "LÃ¼tfen bir resim dosyasÄ± seÃ§in.",
    imageTooLarge:
      labels.imageTooLarge ?? "FotoÄŸraf en fazla 2 MB olabilir.",
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !setPlaceImage) return;

    if (!file.type.startsWith("image/")) {
      alert(t.invalidImage);
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t.imageTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPlaceImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
        boxShadow: "0 5px 18px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 10,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>
          ğŸ“ {t.title}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              border: "none",
              background: "#f3f4f6",
              borderRadius: 10,
              width: 38,
              height: 38,
              fontSize: 18,
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            âœ•
          </button>
        )}
      </div>

      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        {t.name}
      </label>
      <input
        type="text"
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder={t.namePlaceholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          border: "1px solid #d1d5db",
          borderRadius: 10,
          marginBottom: 14,
          fontSize: 15,
        }}
      />

      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        {t.category}
      </label>
      <select
        value={placeCategory}
        onChange={(e) => setPlaceCategory(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          border: "1px solid #d1d5db",
          borderRadius: 10,
          marginBottom: 14,
          fontSize: 15,
          background: "#fff",
        }}
      >
        <option value="">{t.categoryPlaceholder}</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        {t.description}
      </label>
      <textarea
        value={placeDescription}
        onChange={(e) => setPlaceDescription(e.target.value)}
        placeholder={t.descriptionPlaceholder}
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          border: "1px solid #d1d5db",
          borderRadius: 10,
          marginBottom: 14,
          fontSize: 15,
          resize: "vertical",
        }}
      />

      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        ğŸŒ {t.language}
      </label>
      <select
        value={placeLanguage}
        onChange={(e) => setPlaceLanguage(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          border: "1px solid #d1d5db",
          borderRadius: 10,
          marginBottom: 14,
          fontSize: 15,
          background: "#fff",
        }}
      >
        <option value="">{t.languagePlaceholder}</option>
        {languages.map((language) => {
          const value = getOptionValue(language);
          return (
            <option key={value} value={value}>
              {getOptionLabel(language)}
            </option>
          );
        })}
      </select>

      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        ğŸŒ {t.country}
      </label>
      <select
        value={placeCountry}
        onChange={(e) => setPlaceCountry(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 12,
          border: "1px solid #d1d5db",
          borderRadius: 10,
          marginBottom: 14,
          fontSize: 15,
          background: "#fff",
        }}
      >
        <option value="">{t.countryPlaceholder}</option>
        {countries.map((country) => {
          const value = getOptionValue(country);
          return (
            <option key={value} value={value}>
              {getOptionLabel(country)}
            </option>
          );
        })}
      </select>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
          marginBottom: 14,
          background: "#f8fafc",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          ğŸ“· {t.photo}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={imageUploading || submitting}
          style={{ width: "100%", marginBottom: 8 }}
        />

        {imageUploading && (
          <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
            {t.photoPreparing}
          </div>
        )}

        {placeImage && (
          <div style={{ position: "relative", marginTop: 8 }}>
            <img
              src={placeImage}
              alt={t.selectedPhotoAlt}
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 12,
                display: "block",
              }}
            />
            {setPlaceImage && (
              <button
                type="button"
                onClick={() => setPlaceImage("")}
                style={{
                  marginTop: 8,
                  border: "none",
                  borderRadius: 9,
                  padding: "8px 12px",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ğŸ—‘ï¸ {t.removePhoto}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          background: "#f8fafc",
          borderRadius: 12,
          padding: 12,
          marginBottom: 14,
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          ğŸ“ {t.location}
        </div>

        {selectedLocation &&
        Number.isFinite(Number(selectedLocation.lat)) &&
        Number.isFinite(Number(selectedLocation.lng)) ? (
          <div style={{ fontSize: 13, color: "#555", marginBottom: 9 }}>
            {Number(selectedLocation.lat).toFixed(6)},{" "}
            {Number(selectedLocation.lng).toFixed(6)}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#777", marginBottom: 9 }}>
            {t.chooseLocation}
          </div>
        )}

        {onMapSelect && (
          <button
            type="button"
            onClick={onMapSelect}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 10,
              padding: 11,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ğŸ—ºï¸ {t.chooseLocationFromMap}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || imageUploading}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 11,
          padding: 13,
          background:
            submitting || imageUploading ? "#9ca3af" : "#16a34a",
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          cursor:
            submitting || imageUploading ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? `â³ ${t.saving}` : `â• ${t.savePlace}`}
      </button>
    </section>
  );
};

export default AddPlaceForm;
