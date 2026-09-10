import React from "react";

type NavItem = {
  id: "home" | "nearby" | "add" | "favorites" | "profile";
  icon: string;
  label: string;
};

type BottomNavProps = {
  activeNav: NavItem["id"];
  onNavigate: (id: NavItem["id"]) => void;
};

const BottomNav: React.FC<BottomNavProps> = ({
  activeNav,
  onNavigate,
}) => {
  const items: NavItem[] = [
    { id: "home", icon: "🏠", label: "Ana Sayfa" },
    { id: "nearby", icon: "📍", label: "Yakınımda" },
    { id: "add", icon: "➕", label: "Yer Ekle" },
    { id: "favorites", icon: "⭐", label: "Favoriler" },
    { id: "profile", icon: "👤", label: "Profil" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#fff",
        borderTop: "1px solid #ddd",
        boxShadow: "0 -4px 18px rgba(0,0,0,.15)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        padding: "8px 4px",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      {items.map((item) => {
        const active = activeNav === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              border: "none",
              background: "transparent",
              padding: "7px 2px",
              color: active ? "#2563eb" : "#555",
              fontWeight: active ? 700 : 500,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ fontSize: 21 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
