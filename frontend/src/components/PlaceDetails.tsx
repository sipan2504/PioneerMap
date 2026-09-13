import React from "react";

type Place = {
  _id?: string;
  name: string;
  lat?: number;
  lng?: number;
  category?: string;
  description?: string;
  language?: string;
  country?: string;
  username?: string;
  image?: string;
};

type PlaceDetailsLabels = {
  language?: string;
  country?: string;
  anonymous?: string;
  addFavorite?: string;
  removeFavorite?: string;
  share?: string;
  showOnMap?: string;
  delete?: string;
};

type PlaceDetailsProps = {
  place: Place;
  onClose: () => void;
  onShowOnMap?: (place: Place) => void;
  onDelete?: (place: Place) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (place: Place) => void;
  onShare?: (place: Place) => void;
  labels?: PlaceDetailsLabels;
};

const PlaceDetails: React.FC<PlaceDetailsProps> = ({
  place,
  onClose,
  onShowOnMap,
  onDelete,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  labels = {},
}) => {
  const languageLabel = labels.language ?? "Dil";
  const countryLabel = labels.country ?? "Ülke";
  const anonymousLabel = labels.anonymous ?? "Anonim";
  const addFavoriteLabel = labels.addFavorite ?? "Favorilere Ekle";
  const removeFavoriteLabel = labels.removeFavorite ?? "Favorilerden Çıkar";
  const shareLabel = labels.share ?? "Yeri Paylaş";
  const showOnMapLabel = labels.showOnMap ?? "Haritada Göster";
  const deleteLabel = labels.delete ?? "Sil";
  return (
    <section
      id="pioneer-detail-card"
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: 16,
        boxShadow: "0 5px 20px rgba(0,0,0,.15)",
        border: "1px solid #e5e7eb",
      }}
    >
      {place.image && (
        <img
          src={place.image}
          alt={place.name}
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 220px",
              minWidth: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: 8,
              }}
            >
              📍 {place.name}
            </h2>

            {place.category && (
              <div style={{ marginBottom: 8 }}>
                🏷️ {place.category}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 7,
            }}
          >
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(place)}
                style={{
                  width: 40,
                  height: 40,
                  border: "none",
                  borderRadius: "50%",
                  background: isFavorite
                    ? "#FFF3CD"
                    : "#f1f3f5",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ⭐
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "#f3f4f6",
                borderRadius: 10,
                width: 40,
                height: 40,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {place.description && (
          <div
            style={{
              padding: 12,
              background: "#f8fafc",
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            {place.description}
          </div>
        )}

        {place.language && (
          <div style={{ marginBottom: 6 }}>
            🌐 <strong>{languageLabel}:</strong> {place.language}
          </div>
        )}

        {place.country && (
          <div style={{ marginBottom: 6 }}>
            🌍 <strong>{countryLabel}:</strong> {place.country}
          </div>
        )}

        {place.username && (
          <div
            style={{
              marginTop: 8,
              color: "#666",
              fontSize: 13,
            }}
          >
            👤 {place.username ? `@${place.username.replace(/^@/, "")}` : anonymousLabel}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 15,
          }}
        >
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(place)}
              style={{
                width: "100%",
                padding: 13,
                border: "none",
                borderRadius: 10,
                background: isFavorite
                  ? "#FFF3CD"
                  : "#FFD54F",
                color: "#5D4500",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {isFavorite
                ? `⭐ ${removeFavoriteLabel}`
                : `⭐ ${addFavoriteLabel}`}
            </button>
          )}

          {onShare && (
            <button
              type="button"
              onClick={() => onShare(place)}
              style={{
                width: "100%",
                padding: 13,
                border: "none",
                borderRadius: 10,
                background: "#E3F2FD",
                color: "#1565C0",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              📤 {shareLabel}
            </button>
          )}

          {onShowOnMap && (
            <button
              type="button"
              onClick={() => onShowOnMap(place)}
              style={{
                width: "100%",
                padding: 11,
                border: "none",
                borderRadius: 10,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              🗺️ {showOnMapLabel}
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(place)}
              style={{
                width: "100%",
                padding: 11,
                border: "none",
                borderRadius: 10,
                background: "#ef4444",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              🗑️ {deleteLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlaceDetails;
