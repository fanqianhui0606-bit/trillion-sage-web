import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "light-gold";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-bridge-blue text-white hover:bg-bridge-blue-dark shadow-md",
  secondary:
    "bg-white/80 text-bridge-blue border border-bridge-blue/35 hover:bg-white",
  accent:
    "bg-bridge-gold text-white hover:bg-amber-600 shadow-md",
  ghost:
    "bg-transparent text-bridge-blue border border-bridge-blue/30 hover:bg-bridge-blue/5",
  "light-gold":
    "bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 text-amber-900 border border-bridge-gold/70 hover:from-amber-200 hover:via-amber-100 hover:to-amber-200 shadow-sm",
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
  className = "",
  type = "button",
  disabled = false,
  download,
}: {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  download?: boolean | string;
}) {
  const base =
    "inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer";

  const classes = `${base} ${variantStyles[variant]} ${
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
  } ${className}`;

  // 静态资源（PDF 等）走原生 a 标签，避免被 App Router 客户端导航拦截
  if (href && download) {
    return (
      <a href={href} className={classes} download={download} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
