import type { HTMLAttributes } from "react";

type NotificationProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "neutral" | "success" | "error";
};

export function Notification({
  className = "",
  tone = "neutral",
  ...props
}: NotificationProps) {
  return (
    <div
      className={`ui-notification ui-notification-${tone} ${className}`.trim()}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      {...props}
    />
  );
}
