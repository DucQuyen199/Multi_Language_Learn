"use client";

import Link from "next/link";
import { cn } from "@/components/ui";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";
export type LogoVariant = "default" | "light" | "monochrome";

interface LogoMarkProps {
  size?: LogoSize | number;
  variant?: LogoVariant;
  animated?: boolean;
  className?: string;
}

// Simple flat mark: a blue rounded badge with a speech bubble and three
// typing dots — one shape, one accent, readable down to favicon size.
export function LogoMark({
  size = "md",
  variant = "default",
  animated = false,
  className = "",
}: LogoMarkProps) {
  const pixelSize = typeof size === "number" ? size : {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 48,
    xl: 60,
  }[size];

  const badgeFill =
    variant === "monochrome" ? "currentColor" : variant === "light" ? "#FFFFFF" : "#2563EB";
  const bubbleFill = variant === "monochrome" ? "var(--paper)" : variant === "light" ? "#2563EB" : "#FFFFFF";
  const dotFill =
    variant === "monochrome" ? "currentColor" : variant === "light" ? "#FFFFFF" : "#2563EB";

  return (
    <div
      className={cn(
        "logo-mark-wrapper relative inline-flex items-center justify-center select-none flex-shrink-0",
        animated && "logo-mark-animated",
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
      aria-hidden="true"
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform duration-300 hover:scale-105"
      >
        <rect x="6" y="6" width="88" height="88" rx="26" fill={badgeFill} />
        <path d="M36 62 L30 80 L52 62 Z" fill={bubbleFill} />
        <rect x="22" y="22" width="56" height="42" rx="14" fill={bubbleFill} />
        <circle className={animated ? "logo-dot" : undefined} cx="37" cy="43" r="5" fill={dotFill} />
        <circle className={animated ? "logo-dot" : undefined} cx="50" cy="43" r="5" fill={dotFill} />
        <circle className={animated ? "logo-dot" : undefined} cx="63" cy="43" r="5" fill={dotFill} />
      </svg>
    </div>
  );
}

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  showText?: boolean;
  showTagline?: boolean;
  tagline?: string;
  href?: string | null;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({
  size = "md",
  variant = "default",
  showText = true,
  showTagline = true,
  tagline = "MULTI-LANGUAGE LEARN",
  href = "/",
  animated = false,
  className = "",
  onClick,
}: LogoProps) {
  const content = (
    <div
      className={cn(
        "logo-lockup inline-flex items-center gap-3 select-none group transition-all duration-200",
        className
      )}
      onClick={!href ? onClick : undefined}
    >
      <LogoMark size={size} variant={variant} animated={animated} />

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5 font-sans">
            <span
              className={cn(
                "font-black tracking-tight tracking-[-0.04em]",
                size === "xs" && "text-sm",
                size === "sm" && "text-base",
                size === "md" && "text-[19px]",
                size === "lg" && "text-2xl",
                size === "xl" && "text-3xl",
                variant === "light" ? "text-white" : "text-slate-900 dark:text-white"
              )}
            >
              Lingua
            </span>
            <span
              className={cn(
                "font-extrabold uppercase tracking-wider rounded-md px-1.5 py-0.5",
                size === "xs" && "text-[9px] px-1 py-0",
                size === "sm" && "text-[10px]",
                size === "md" && "text-[11px]",
                size === "lg" && "text-xs",
                size === "xl" && "text-sm",
                variant === "light"
                  ? "bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20"
              )}
            >
              Atlas
            </span>
          </div>

          {showTagline && size !== "xs" && (
            <span
              className={cn(
                "font-semibold tracking-[0.22em] uppercase mt-1",
                size === "sm" && "text-[7.5px]",
                size === "md" && "text-[8.5px]",
                size === "lg" && "text-[10px]",
                size === "xl" && "text-xs",
                variant === "light" ? "text-blue-200/80" : "text-slate-500 dark:text-slate-400"
              )}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
        aria-label="LinguaAtlas Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

