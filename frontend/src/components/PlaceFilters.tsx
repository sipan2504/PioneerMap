import React from "react";

type PlaceFiltersProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeLanguage: string;
  onLanguageChange: (language: string) => void;
  activeCountry: string;
  onCountryChange: (country: string) => void;
  languages: string[];
  countries: string[];
};

const PlaceFilters: React.FC<PlaceFiltersProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  activeLanguage,
  onLanguageChange,
  activeCountry,
  onCountryChange,
  languages,
  countries,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            style={{
              flex: "0 0 auto",
              padding: "9px 13px",
              borderRadius: 20,
              border: "1px solid #ddd",
              background:
                activeCategory === category ? "#2563eb" : "#fff",
              color:
                activeCategory === category ? "#fff" : "#333",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <select
          value={activeLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          <option value="All">🌐 Tüm Diller</option>
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>

        <select
          value={activeCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          <option value="All">🌍 Tüm Ülkeler</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PlaceFilters;
