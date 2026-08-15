"use client";

import React from "react";
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

  // Unique ID prefix for gradients to prevent SVG clashes when multiple logos are rendered
  const id = React.useId().replace(/:/g, "");

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
        <defs>
          {/* Primary Gradient: Classic Royal Blue to Deep Sapphire */}
          <linearGradient id={`${id}-grad-primary`} x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Accent Gradient: Subtle Cyan to Classic Emerald */}
          <linearGradient id={`${id}-grad-accent`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Warm Spark Gradient: Refined Amber */}
          <linearGradient id={`${id}-grad-spark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Glass Highlight */}
          <linearGradient id={`${id}-grad-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.03" />
          </linearGradient>

          {/* Ambient Glow Filter */}
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Backing Glow */}
        <circle cx="50" cy="50" r="42" fill={`url(#${id}-grad-primary)`} opacity="0.14" filter={`url(#${id}-glow)`} />

        {/* Base Rounded Shield */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          fill={variant === "light" ? "rgba(255,255,255,0.12)" : "url(#" + id + "-grad-primary)"}
          className="transition-all duration-300"
        />

        {/* Inner Border */}
        <rect
          x="7"
          y="7"
          width="86"
          height="86"
          rx="23"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          fill="none"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* Specular Sheen */}
        <path
          d="M7 32C7 18.1929 18.1929 7 32 7H68C72.5 7 76.5 8.5 80 11C60 16 35 32 20 60C12 48 7 40 7 32Z"
          fill={`url(#${id}-grad-sheen)`}
        />

        {/* Global Meridian Ribbons - Language Atlas Wave */}
        {/* Left Speech & Atlas Loop */}
        <path
          d="M28 50C28 36 38 24 52 24C66 24 76 34 76 48C76 60 66 70 52 70C46 70 41 68 37 64L24 73L27 60C25 57 24 53.5 24 50"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.25"
        />

        {/* Dynamic Forward Arc: Communication / Polyglot Bridge */}
        <path
          d="M32 64C36.5 68 43 71 50 71C63.2548 71 74 60.2548 74 47C74 34.5 64.5 24.5 52 24"
          stroke={`url(#${id}-grad-accent)`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ascending Knowledge Curve */}
        <path
          d="M26 48C26 34.7452 36.7452 24 50 24C57 24 63.5 27 68 32"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Inner Atlas Grid Lines (Subtle latitude/longitude) */}
        <ellipse cx="50" cy="47.5" rx="14" ry="22.5" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" strokeOpacity="0.4" fill="none" />
        <line x1="28" y1="47.5" x2="72" y2="47.5" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" strokeOpacity="0.4" />

        {/* Core Polyglot Spark / AI Intelligence Nexus */}
        <g className={animated ? "logo-spark-pulse" : ""}>
          <circle cx="68" cy="32" r="5.5" fill={`url(#${id}-grad-spark)`} />
          <circle cx="68" cy="32" r="8" stroke="#FDE68A" strokeWidth="1.5" opacity="0.75" />
          <circle cx="32" cy="62" r="3.5" fill="#34D399" />
          <circle cx="50" cy="47.5" r="4" fill="#FFFFFF" />
        </g>
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

