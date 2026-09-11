import type { CSSProperties } from "react";

export type PlaceCardPlace = {
  _id?: string;
  name: string;
  category?: string;
  description?: string;
  language?: string;
  country?: string;
  username?: string;
  image?: string;
};

type PlaceCardProps = {
  place: PlaceCardPlace;
  icon?: string;
  onSelect?: (place: PlaceCardPlace) => void;
  onDelete?: (place: PlaceCardPlace) => void;
  onToggleFavorite?: (place: PlaceCardPlace) => void;
  isFavorite?: boolean;
};

const buttonBase: CSSProperties = {
  border: "none",
  borderRadius: 9,
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const PlaceCard = ({
  place,
  icon = "📍",
  onSelect,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
}: PlaceCardProps) => {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: "0 3px 12px rgba(0,0,0,.08)",
      }}
    >
      {place.image && (
        <img
          src={place.image}
          alt={place.name}
          style={{
            width: "100%",
            height: 170,
            objectFit: "cover",
            borderRadius: 10,
            display: "block",
            marginBottom: 12,
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            {icon} {place.name}
          </div>

          {place.category && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 5 }}>
              {place.category}
            </div>
          )}

          {place.description && (
            <div style={{ fontSize: 14, color: "#333", marginBottom: 7 }}>
              {place.description}
            </div>
          )}

          {(place.language || place.country) && (
            <div style={{ fontSize: 13, color: "#555" }}>
              {place.language && `🌐 ${place.language}`}
              {place.language && place.country && "  •  "}
              {place.country && `🌍 ${place.country}`}
            </div>
          )}

          {place.username && (
            <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
              👤 {place.username}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(place)}
            style={{ ...buttonBase, flex: 1, background: "#2563eb", color: "#fff" }}
          >
            📍 Gör
          </button>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(place)}
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            style={{
              ...buttonBase,
              background: isFavorite ? "#fef3c7" : "#f3f4f6",
              color: isFavorite ? "#b45309" : "#374151",
            }}
          >
            {isFavorite ? "★ Favoride" : "☆ Favori"}
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(place)}
            style={{ ...buttonBase, background: "#ef4444", color: "#fff" }}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
