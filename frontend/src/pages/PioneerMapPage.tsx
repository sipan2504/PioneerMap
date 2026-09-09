import { useState } from "react";

function PioneerMapPage() {
  const [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const loginWithPi = async () => {
    try {
      if (!window.Pi) {
        setStatus("Pi SDK yüklenemedi.");
        return;
      }

      await window.Pi.init({
        version: "2.0",
        sandbox: false,
      });

      const auth = await window.Pi.authenticate(
        ["username"],
        () => true
      );

      setSignedIn(true);
      setStatus(`Hoş geldin @${auth.user.username}`);
    } catch (error) {
      console.error(error);
      setStatus("Pi Sign-In başarısız oldu.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <h1>🗺️ PioneerMap</h1>

      <p>
        Discover Pi-powered stores, products, services, and businesses near
        you.
      </p>

      {!signedIn ? (
        <button
          onClick={loginWithPi}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
          }}
        >
          🔐 Sign in with Pi
        </button>
      ) : (
        <div
          style={{
            display: "inline-block",
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            background: "#e8f5e9",
            color: "#2e7d32",
            fontWeight: "bold",
          }}
        >
          ✅ Pi Connected
        </div>
      )}

      {status && (
        <p
          style={{
            marginTop: "15px",
            fontWeight: "bold",
          }}
        >
          {status}
        </p>
      )}

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button>🏠 Stays</button>
        <button>🛍️ Shops</button>
        <button>🍔 Food</button>
        <button>🔧 Services</button>
        <button>💼 Jobs</button>
      </div>
    </div>
  );
}

export default PioneerMapPage;
