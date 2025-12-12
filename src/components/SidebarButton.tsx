interface SidebarButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function SidebarButton({
  label,
  isActive = false,
  onClick,
}: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "32px 16px",
        borderRadius: "6px",
        border: "none",
        fontWeight: "500",
        transition: "all 0.2s",
        cursor: "pointer",
        background: isActive ? "#45475a" : "transparent",
        color: isActive ? "#89b4fa" : "#cdd6f4",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "#313244";
          e.currentTarget.style.color = "#cdd6f4";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#cdd6f4";
        }
      }}
    >
      <span>{label}</span>
    </button>
  );
}
