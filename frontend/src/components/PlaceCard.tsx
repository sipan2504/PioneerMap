import React from "react";

export type PlaceCardPlace = {
  _id?: string;
  name: string;
  category?: string;
  description?: string;
  language?: string;
  country?: string;
  username?: string;
};

type PlaceCardProps = {
  place: PlaceCardPlace;
  icon?: string;
  onSelect?: (place: PlaceCardPlace) => void;
  onDelete?: (place: PlaceCardPlace) => void;
};

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  icon = "📍",
  onSelect,
  onDelete,
}) => {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
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

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
        }}
      >
        {onSelect && (
          <button
            onClick={() => onSelect(place)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 9,
              padding: "9px 10px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📍 Gör
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(place)}
            style={{
              border: "none",
              borderRadius: 9,
              padding: "9px 12px",
              background: "#ef4444",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
