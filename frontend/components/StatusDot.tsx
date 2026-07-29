interface StatusDotProps {
  color?: "success" | "warning" | "danger" | "signal";
  pulse?: boolean;
}

const colorMap: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  signal: "bg-signal",
};

const pulseColorMap: Record<string, string> = {
  success: "rgba(22,163,74,0.35)",
  warning: "rgba(217,119,6,0.35)",
  danger: "rgba(220,38,38,0.35)",
  signal: "rgba(41,82,245,0.35)",
};

/** The app's signature "actively monitored" indicator — a small pulsing dot. */
export default function StatusDot({
  color = "signal",
  pulse = true,
}: StatusDotProps) {
  return (
    <span
      className={`relative inline-flex h-2 w-2 rounded-full ${colorMap[color]} ${
        pulse ? "pulse-dot" : ""
      }`}
      style={
        pulse
          ? ({ "--pulse-color": pulseColorMap[color] } as React.CSSProperties)
          : undefined
      }
    />
  );
}
