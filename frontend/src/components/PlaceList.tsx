import PlaceCard, { type PlaceCardPlace } from "./PlaceCard";

type PlaceListProps = {
  places: PlaceCardPlace[];
  categoryIcons?: Record<string, string>;
  onSelect?: (place: PlaceCardPlace) => void;
  onDelete?: (place: PlaceCardPlace) => void;
  onToggleFavorite?: (place: PlaceCardPlace) => void;
  isFavorite?: (place: PlaceCardPlace) => boolean;
};

const PlaceList = ({
  places,
  categoryIcons = {},
  onSelect,
  onDelete,
  onToggleFavorite,
  isFavorite,
}: PlaceListProps) => {
  if (places.length === 0) {
    return <div style={{ textAlign: "center", padding: 24, color: "#777" }}>📍 Gösterilecek yer bulunamadı.</div>;
  }

  return (
    <div>
      {places.map((place) => (
        <PlaceCard
          key={place._id || `${place.name}-${place.username || ""}`}
          place={place}
          icon={categoryIcons[place.category || ""] || "📍"}
          onSelect={onSelect}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite ? isFavorite(place) : false}
        />
      ))}
    </div>
  );
};

export default PlaceList;
