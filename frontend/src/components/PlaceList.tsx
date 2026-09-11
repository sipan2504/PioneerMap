import type { CSSProperties } from "react";
import PlaceCard, { type PlaceCardLabels, type PlaceCardPlace } from "./PlaceCard";

export type PlaceListLabels = PlaceCardLabels & {
  title?: string;
  empty?: string;
  results?: string;
};

type PlaceListProps = {
  places: PlaceCardPlace[];
  categoryIcons?: Record<string, string>;
  onSelect?: (place: PlaceCardPlace) => void;
  onDelete?: (place: PlaceCardPlace) => void;
  onToggleFavorite?: (place: PlaceCardPlace) => void;
  isFavorite?: (place: PlaceCardPlace) => boolean;
  labels?: PlaceListLabels;
};

const styles: Record<string, CSSProperties> = {
  section: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 18,
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    margin: 0,
    color: "#111827",
    fontSize: 21,
    fontWeight: 850,
    letterSpacing: "-0.03em",
  },
  count: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  empty: {
    padding: "28px 18px",
    textAlign: "center",
    border: "1px dashed #cbd5e1",
    borderRadius: 18,
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 650,
  },
};

const PlaceList = ({
  places,
  categoryIcons = {},
  onSelect,
  onDelete,
  onToggleFavorite,
  isFavorite,
  labels,
}: PlaceListProps) => {
  const text = {
    title: labels?.title ?? "Yerler",
    empty: labels?.empty ?? "Henüz gösterilecek yer yok.",
    results: labels?.results ?? "sonuç",
  };

  return (
    <section style={styles.section} aria-label={text.title}>
      <div style={styles.header}>
        <h2 style={styles.title}>{text.title}</h2>
        <span style={styles.count}>
          {places.length} {text.results}
        </span>
      </div>

      {places.length === 0 ? (
        <div style={styles.empty}>{text.empty}</div>
      ) : (
        <div style={styles.list}>
          {places.map((place, index) => {
            const key = place._id || `${place.name}-${index}`;

            return (
              <PlaceCard
                key={key}
                place={place}
                icon={
                  place.category
                    ? categoryIcons[place.category] ?? "•"
                    : "•"
                }
                onSelect={onSelect}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite ? isFavorite(place) : false}
                labels={labels}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PlaceList;
