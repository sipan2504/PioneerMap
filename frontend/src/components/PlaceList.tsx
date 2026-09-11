import type { CSSProperties } from "react";
import PlaceCard, { type PlaceCardLabels, type PlaceCardPlace } from "./PlaceCard";

type PlaceListProps = {
  places: PlaceCardPlace[];
  categoryIcons?: Record<string, string>;
  onSelect?: (place: PlaceCardPlace) => void;
  onDelete?: (place: PlaceCardPlace) => void;
  onToggleFavorite?: (place: PlaceCardPlace) => void;
  isFavorite?: (place: PlaceCardPlace) => boolean;
  labels?: PlaceCardLabels & {
    title?: string;
    empty?: string;
    results?: string;
  };
};

const styles: Record<string, CSSProperties> = {
  section: { width: "100%", boxSizing: "border-box", marginTop: 18 },
  header: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 12, marginBottom: 14,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 850, color: "#111827" },
  count: { fontSize: 12, color: "#6b7280", fontWeight: 700 },
  empty: {
    padding: 24, border: "1px dashed #cbd5e1", borderRadius: 16,
    background: "#f8fafc", color: "#64748b", textAlign: "center",
  },
};

const PlaceList = ({
  places,
  categoryIcons = {},
  onSelect,
  onDelete,
  onToggleFavorite,
  isFavorite,
  labels = {},
}: PlaceListProps) => {
  const title = labels.title ?? "Places";
  const empty = labels.empty ?? "No places found.";
  const results = labels.results ?? "results";

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <span style={styles.count}>{places.length} {results}</span>
      </div>

      {places.length === 0 ? (
        <div style={styles.empty}>{empty}</div>
      ) : (
        places.map((place) => (
          <PlaceCard
            key={place._id ?? `${place.name}-${place.country ?? ""}`}
            place={place}
            icon={categoryIcons[place.category ?? ""] ?? "📍"}
            onSelect={onSelect}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite ? isFavorite(place) : false}
            labels={labels}
          />
        ))
      )}
    </section>
  );
};

export default PlaceList;
