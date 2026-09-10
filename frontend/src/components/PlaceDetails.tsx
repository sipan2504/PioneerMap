import React from "react";

type Place = {
  _id?: string;
  name: string;
  category?: string;
  description?: string;
  language?: string;
  country?: string;
  username?: string;
};

type PlaceDetailsProps = {
  place: Place;
  onClose: () => void;
  onShowOnMap?: (place: Place) => void;
  onDelete?: (place: Place) => void;
};

const PlaceDetails: React.FC<PlaceDetailsProps> = ({
  place,
  onClose,
  onShowOnMap,
  onDelete,
}) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        boxShadow: "0 5px 20px rgba(0,0,0,.15)",
        border: "1px solid #e5e7eb",
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
        <div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>
            📍 {place.name}
          </h2>

          {place.category && (
            <div style={{ marginBottom: 8 }}>
              🏷️ {place.category}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "#f3f4f6",
            borderRadius: 10,
            width: 36,
            height: 36,
            fontSize: 18,
          }}
        >
          ✕
        </button>
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
          🌐 <strong>Dil:</strong> {place.language}
        </div>
      )}

      {place.country && (
        <div style={{ marginBottom: 6 }}>
          🌍 <strong>Ülke:</strong> {place.country}
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
          👤 Ekleyen: @{place.username.replace(/^@/, "")}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 14,
        }}
      >
        {onShowOnMap && (
          <button
            onClick={() => onShowOnMap(place)}
            style={{
              flex: 1,
              padding: 11,
              border: "none",
              borderRadius: 10,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            🗺️ Haritada Göster
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(place)}
            style={{
              padding: "11px 14px",
              border: "none",
              borderRadius: 10,
              background: "#ef4444",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            🗑️ Sil
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceDetails;
