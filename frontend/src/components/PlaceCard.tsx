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

export type PlaceCardLabels = {
  view?: string;
  favorite?: string;
  favorited?: string;
  delete?: string;
  anonymous?: string;
  category?: string;
  language?: string;
  country?: string;
};

type PlaceCardProps = {
  place: PlaceCardPlace;
  icon?: string;
  onSelect?: (place: PlaceCardPlace) => void;
  onDelete?: (place: PlaceCardPlace) => void;
  onToggleFavorite?: (place: PlaceCardPlace) => void;
  isFavorite?: boolean;
  labels?: PlaceCardLabels;
};

const buttonBase: CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const PlaceCard = ({
  place,
  icon = "📍",
  onSelect,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
  labels = {},
}: PlaceCardProps) => {
  const view = labels.view ?? "View";
  const favorite = labels.favorite ?? "Favorite";
  const favorited = labels.favorited ?? "Favorited";
  const remove = labels.delete ?? "Delete";
  const anonymous = labels.anonymous ?? "Anonymous";

  return (
    <article style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 12,
      boxShadow: "0 5px 18px rgba(15,23,42,.08)",
    }}>
      {place.image && (
        <img
          src={place.image}
          alt={place.name}
          style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }}
        />
      )}

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 850, color: "#111827" }}>
              {icon} {place.name}
            </h3>

            {place.category && (
              <div style={{
                display: "inline-block",
                marginTop: 8,
                padding: "5px 9px",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: 12,
                fontWeight: 800,
              }}>
                {place.category}
              </div>
            )}

            {place.description && (
              <p style={{ margin: "10px 0 8px", color: "#374151", lineHeight: 1.45 }}>
                {place.description}
              </p>
            )}

            {(place.language || place.country) && (
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                {place.language && <>🌐 {place.language}</>}
                {place.language && place.country && " • "}
                {place.country && <>🌍 {place.country}</>}
              </div>
            )}

            <div style={{ marginTop: 7, fontSize: 12, color: "#9ca3af" }}>
              👤 {place.username ? `@${place.username.replace(/^@/, "")}` : anonymous}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {onSelect && (
            <button type="button" onClick={() => onSelect(place)}
              style={{ ...buttonBase, flex: 1, background: "#2563eb", color: "#fff" }}>
              {view}
            </button>
          )}

          {onToggleFavorite && (
            <button type="button" onClick={() => onToggleFavorite(place)}
              aria-label={isFavorite ? favorited : favorite}
              style={{
                ...buttonBase,
                background: isFavorite ? "#fef3c7" : "#f3f4f6",
                color: isFavorite ? "#92400e" : "#374151",
              }}>
              {isFavorite ? `★ ${favorited}` : `☆ ${favorite}`}
            </button>
          )}

          {onDelete && (
            <button type="button" onClick={() => onDelete(place)}
              style={{ ...buttonBase, background: "#ef4444", color: "#fff" }}>
              {remove}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PlaceCard;
