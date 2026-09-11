import React, { type ChangeEvent } from "react";

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

  selectedLocation?: {
    lat: number;
    lng: number;
  } | null;

  onMapSelect?: () => void;
  onSubmit: () => void;
  onCancel?: () => void;

  submitting?: boolean;

  // Photo support
  placeImage?: string;
  setPlaceImage?: (value: string) => void;
  imageUploading?: boolean;
};

const getOptionValue = (
  item: string | { value: string; label: string }
) => {
  return typeof item === "string" ? item : item.value;
};

const getOptionLabel = (
  item: string | { value: string; label: string }
) => {
  return typeof item === "string" ? item : item.label;
};

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
}) => {
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !setPlaceImage) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Fotoğraf en fazla 2 MB olabilir.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPlaceImage(reader.result);
      }
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
        <h2
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 800,
          }}
        >
          📍 Yeni Yer Ekle
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
          >
            ✕
          </button>
        )}
      </div>

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        İşletme / Yer Adı
      </label>

      <input
        type="text"
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder="Örn: Dilek's Home"
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

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Kategori
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
        <option value="">Kategori seçin</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Açıklama
      </label>

      <textarea
        value={placeDescription}
        onChange={(e) => setPlaceDescription(e.target.value)}
        placeholder="Yer hakkında kısa bilgi..."
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

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        🌐 Dil
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
        <option value="">Dil seçin</option>

        {languages.map((language) => {
          const value = getOptionValue(language);
          const label = getOptionLabel(language);

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        🌍 Ülke
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
        <option value="">Ülke seçin</option>

        {countries.map((country) => {
          const value = getOptionValue(country);
          const label = getOptionLabel(country);

          return (
            <option key={value} value={value}>
              {label}
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
        <div
          style={{
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          📷 Fotoğraf
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={imageUploading || submitting}
          style={{
            width: "100%",
            marginBottom: 8,
          }}
        />

        {imageUploading && (
          <div
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 8,
            }}
          >
            Fotoğraf hazırlanıyor...
          </div>
        )}

        {placeImage && (
          <div
            style={{
              position: "relative",
              marginTop: 8,
            }}
          >
            <img
              src={placeImage}
              alt="Seçilen fotoğraf"
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
                🗑️ Fotoğrafı Kaldır
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
        <div
          style={{
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          📍 Konum
        </div>

        {selectedLocation ? (
          <div
            style={{
              fontSize: 13,
              color: "#555",
              marginBottom: 9,
            }}
          >
            {selectedLocation.lat.toFixed(6)},{" "}
            {selectedLocation.lng.toFixed(6)}
          </div>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: "#777",
              marginBottom: 9,
            }}
          >
            Haritadan bir konum seçin.
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
            🗺️ Haritadan Konum Seç
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
            submitting || imageUploading
              ? "not-allowed"
              : "pointer",
        }}
      >
        {submitting ? "⏳ Kaydediliyor..." : "➕ Yeri Kaydet"}
      </button>
    </section>
  );
};

export default AddPlaceForm;
