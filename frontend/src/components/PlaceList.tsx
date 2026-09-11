import React from "react";
import PlaceCard, { type PlaceCardPlace } from "./PlaceCard";

type PlaceListProps = {
  places: PlaceCardPlace[];

  categoryIcons?: Record<string, string>;

  onSelect?: (place: PlaceCardPlace) => void;

  onDelete?: (place: PlaceCardPlace) => void;

  onToggleFavorite?: (place: PlaceCardPlace) => void;

  isFavorite?: (place: PlaceCardPlace) => boolean;
};

const PlaceList: React.FC<PlaceListProps> = ({
  places,
  categoryIcons = {},
  onSelect,
  onDelete,
  onToggleFavorite,
  isFavorite,
}) => {
  if (places.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 30,
          color: "#777",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            fontSize: 32,
            marginBottom: 8,
          }}
        >
          📍
        </div>

        <div
          style={{
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Gösterilecek yer bulunamadı.
        </div>

        <div
          style={{
            fontSize: 13,
          }}
        >
          Filtreleri değiştirerek tekrar deneyin.
        </div>
      </div>
    );
  }

  return (
    <div>
      {places.map((place) => (
        <PlaceCard
          key={
            place._id ||
            `${place.name}-${place.username || ""}`
          }
          place={place}
          icon={
            categoryIcons[place.category || ""] ||
            "📍"
          }
          onSelect={onSelect}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          isFavorite={
            isFavorite
              ? isFavorite(place)
              : false
          }
        />
      ))}
    </div>
  );
};

export default PlaceList;
