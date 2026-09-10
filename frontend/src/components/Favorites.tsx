import React from "react";

type FavoritePlace = {
  _id?: string;
  name: string;
  category?: string;
  description?: string;
};

type FavoritesProps = {
  favorites?: FavoritePlace[];
  onRemove?: (id: string) => void;
  onPlaceClick?: (place: FavoritePlace) => void;
};

export default function Favorites({
  favorites = [],
  onRemove,
  onPlaceClick,
}: FavoritesProps) {
  if (favorites.length === 0) {
    return (
      <div
        style={{
          padding: "25px 15px",
          textAlign: "center",
          color: "#666",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "10px" }}>
          ⭐
        </div>

        <h3 style={{ margin: "0 0 8px" }}>
          Favoriler
        </h3>

        <p style={{ margin: 0 }}>
          Henüz favori yeriniz yok.
        </p>
      </div>
    );
  }

  return (
    <section style={{ padding: "15px" }}>
      <h2 style={{ marginTop: 0 }}>
        ⭐ Favoriler
      </h2>

      <div
        style={{
          display: "grid",
          gap: "12px",
        }}
      >
        {favorites.map((place) => (
          <div
            key={place._id || place.name}
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,.10)",
            }}
          >
            <h3 style={{ margin: "0 0 6px" }}>
              {place.name}
            </h3>

            {place.category && (
              <div style={{ fontSize: "13px", color: "#666" }}>
                {place.category}
              </div>
            )}

            {place.description && (
              <p style={{ margin: "8px 0" }}>
                {place.description}
              </p>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              {onPlaceClick && (
                <button
                  type="button"
                  onClick={() => onPlaceClick(place)}
                >
                  Görüntüle
                </button>
              )}

              {onRemove && place._id && (
                <button
                  type="button"
                  onClick={() => onRemove(place._id!)}
                >
                  Favoriden Çıkar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
