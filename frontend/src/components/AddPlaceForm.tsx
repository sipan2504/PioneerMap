import React from "react";

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
  languages: string[];
  countries: string[];
  selectedLocation: { lat: number; lng: number } | null;
  onMapSelect: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
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
}) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        boxShadow: "0 4px 18px rgba(0,0,0,.12)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ marginTop: 0 }}>📍 Yer Ekle</h3>

      <input
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder="Yer / işletme adı"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 11,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      />

      <select
        value={placeCategory}
        onChange={(e) => setPlaceCategory(e.target.value)}
        style={{
          width: "100%",
          padding: 11,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "#fff",
        }}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <textarea
        value={placeDescription}
        onChange={(e) => setPlaceDescription(e.target.value)}
        placeholder="Açıklama"
        rows={3}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 11,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
          resize: "vertical",
        }}
      />

      <select
        value={placeLanguage}
        onChange={(e) => setPlaceLanguage(e.target.value)}
        style={{
          width: "100%",
          padding: 11,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <option value="">🌐 Dil seç</option>
        {languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>

      <select
        value={placeCountry}
        onChange={(e) => setPlaceCountry(e.target.value)}
        style={{
          width: "100%",
          padding: 11,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <option value="">🌍 Ülke seç</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <button
        onClick={onMapSelect}
        style={{
          width: "100%",
          padding: 11,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #2563eb",
          background: "#eff6ff",
          color: "#2563eb",
          fontWeight: 700,
        }}
      >
        {selectedLocation
          ? "📍 Konum seçildi"
          : "🗺️ Haritadan konum seç"}
      </button>

      {selectedLocation && (
        <div
          style={{
            fontSize: 12,
            color: "#666",
            marginBottom: 10,
          }}
        >
          📍 {selectedLocation.lat.toFixed(5)},{" "}
          {selectedLocation.lng.toFixed(5)}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: 11,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          İptal
        </button>

        <button
          onClick={onSubmit}
          disabled={submitting}
          style={{
            flex: 1,
            padding: 11,
            borderRadius: 10,
            border: "none",
            background: submitting ? "#9ca3af" : "#16a34a",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {submitting ? "Ekleniyor..." : "➕ Ekle"}
        </button>
      </div>
    </div>
  );
};

export default AddPlaceForm;
