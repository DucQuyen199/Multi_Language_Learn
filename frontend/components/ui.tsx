import type { LucideIcon } from "lucide-react";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "blue" | "green" | "orange" | "purple" }) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}

export function ProgressBar({ value, tone = "primary", label }: { value: number; tone?: "primary" | "green" | "orange" | "purple"; label?: string }) {
  return (
    <div className="progress-wrap" aria-label={label ? `${label}: ${value}%` : `${value}% complete`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("progress-track", `progress-${tone}`)}><span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, meta, tone = "blue" }: { icon: LucideIcon; label: string; value: string | number; meta: string; tone?: "blue" | "green" | "orange" | "purple" }) {
  return (
    <article className="stat-card">
      <div className={cn("stat-icon", `stat-${tone}`)}><Icon size={18} strokeWidth={2.2} /></div>
      <div className="stat-copy"><p>{label}</p><strong>{value}</strong><span>{meta}</span></div>
    </article>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={cn("skeleton", className)} aria-hidden="true" />;
}

export function EmptyState({ icon: Icon, title, description, action, children }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ?? children}
    </div>
  );
}

export function MiniBars({ values, tone = "blue" }: { values: number[]; tone?: "blue" | "green" | "orange" }) {
  return <div className={cn("mini-bars", `bars-${tone}`)} aria-hidden="true">{values.map((value, index) => <span key={`${value}-${index}`} style={{ height: `${value}%` }} />)}</div>;
}
