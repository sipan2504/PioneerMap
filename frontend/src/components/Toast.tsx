type ToastProps = {
  message: string;
  onClose?: () => void;
};

export default function Toast({
  message,
  onClose,
}: ToastProps) {
  if (!message) return null;

  const isError =
    message.includes("❌") ||
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("failed");

  const isSuccess =
    message.includes("✅") ||
    message.toLowerCase().includes("success");

  return (
    <div
      style={{
        position: "fixed",
        top: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        width: "calc(100% - 30px)",
        maxWidth: "480px",
        padding: "13px 16px",
        borderRadius: "12px",
        background: isError
          ? "#dc2626"
          : isSuccess
          ? "#16a34a"
          : "#1976d2",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "700",
        textAlign: "center",
        boxShadow: "0 5px 20px rgba(0,0,0,.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <span style={{ flex: 1 }}>
        {message}
      </span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 0,
            background: "transparent",
            color: "#fff",
            fontSize: "20px",
            fontWeight: "700",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
