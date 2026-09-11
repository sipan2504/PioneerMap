type FavoritePlace = {
  _id?: string;
  name: string;
  category?: string;
  description?: string;
  language?: string;
  country?: string;
  username?: string;
  image?: string;
};

type FavoritesProps = {
  favorites: FavoritePlace[];
  onRemove: (id: string) => void;
  onPlaceClick?: (place: FavoritePlace) => void;
};

const Favorites = ({ favorites, onRemove, onPlaceClick }: FavoritesProps) => {
  if (favorites.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", color: "#777" }}>⭐ Henüz favori eklenmedi.</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>⭐ Favoriler</h2>
      {favorites.map((place, index) => {
        const id = place._id || `${place.name}-${index}`;
        return (
          <div key={id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, marginBottom: 10 }}>
            {place.image && <img src={place.image} alt={place.name} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} />}
            <div style={{ fontWeight: 700, fontSize: 16 }}>📍 {place.name}</div>
            {place.category && <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{place.category}</div>}
            {place.country && <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>🌍 {place.country}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {onPlaceClick && <button type="button" onClick={() => onPlaceClick(place)} style={{ flex: 1, border: "none", borderRadius: 9, padding: 10, background: "#2563eb", color: "#fff", fontWeight: 700 }}>📍 Gör</button>}
              {place._id && <button type="button" onClick={() => onRemove(place._id!)} style={{ border: "none", borderRadius: 9, padding: "10px 14px", background: "#ef4444", color: "#fff", fontWeight: 700 }}>🗑️</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Favorites;
