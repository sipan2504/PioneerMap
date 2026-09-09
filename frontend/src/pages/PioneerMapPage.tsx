import { useState } from "react";

function PioneerMapPage() {
  const [status, setStatus] = useState("");

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

      setStatus(`Hoş geldin @${auth.user.username}`);
    } catch (error) {
      console.error(error);
      setStatus("Pi Sign-In başarısız oldu.");
    }
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>🗺️ PioneerMap</h1>

      <p>
        Discover Pi-powered stores, products, services, and businesses near
        you.
      </p>

      <button onClick={loginWithPi}>
        🔐 Sign in with Pi
      </button>

      {status && <p>{status}</p>}

      <div style={{ marginTop: "30px" }}>
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
