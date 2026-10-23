import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      {...props}
    />
  );
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  variant?: ButtonVariant;
};

export function LinkButton({
  className = "",
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      {...props}
    />
  );
}
