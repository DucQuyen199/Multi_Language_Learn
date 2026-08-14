"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookA,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  FileText,
  Flame,
  Headphones,
  LayoutDashboard,
  Library,
  Menu,
  Mic2,
  NotebookPen,
  PencilLine,
  Search,
  Settings,
  Sparkles,
  StretchHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/components/ui";
import { t } from "@/lib/i18n";

type NavItem = { href: string; label: string; icon: LucideIcon; shortcut?: string };

const primaryNav: NavItem[] = [
  { href: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dictionary", label: "Dictionary", icon: Search, shortcut: "D" },
  { href: "/app/vocabulary", label: "Vocabulary", icon: Library, shortcut: "V" },
  { href: "/app/grammar", label: "Grammar", icon: BookA },
  { href: "/app/listening", label: "Listening", icon: Headphones, shortcut: "L" },
  { href: "/app/speaking", label: "Speaking", icon: Mic2, shortcut: "S" },
  { href: "/app/reading", label: "Reading", icon: BookOpen, shortcut: "R" },
  { href: "/app/writing", label: "Writing", icon: PencilLine, shortcut: "W" },
  { href: "/app/flashcards", label: "Flashcards", icon: StretchHorizontal },
  { href: "/app/courses", label: "Courses", icon: FileText },
  { href: "/app/ai-tutor", label: "AI Tutor", icon: BrainCircuit },
];

const secondaryNav: NavItem[] = [
  { href: "/app/progress", label: "Progress", icon: BarChart3 },
  { href: "/app/notebook", label: "Notebook", icon: NotebookPen },
];

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onNavigate} className={cn("nav-link", active && "nav-link-active")}>
      <Icon size={17} strokeWidth={active ? 2.4 : 1.9} />
      <span>{t(`nav.${item.label === "AI Tutor" ? "aiTutor" : item.label.toLowerCase()}`)}</span>
      {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({ code: "en", flag: "🇬🇧", label: "English" });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notify } = useActionFeedback();
  const isActive = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setMobileOpen(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/dictionary");
        return;
      }
      if (editing || event.metaKey || event.ctrlKey || event.altKey) return;
      const shortcuts: Record<string, string> = { d: "/dictionary", v: "/app/vocabulary", l: "/app/listening", s: "/app/speaking", r: "/app/reading", w: "/app/writing" };
      const destination = shortcuts[event.key.toLowerCase()];
      if (destination) router.push(destination);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [router]);

  return (
    <div className="app-frame">
      <aside className={cn("app-sidebar", mobileOpen && "app-sidebar-open")}>
        <div className="sidebar-brand">
          <Link href="/" className="brand-lockup" onClick={close}>
            <span className="brand-mark"><Sparkles size={17} /></span>
            <span><strong>Lingua</strong><small>ATLAS</small></span>
          </Link>
          <button type="button" className="sidebar-close icon-button" onClick={close} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="language-switcher-wrap">
          <button type="button" className="language-switcher" onClick={() => setLanguageOpen((value) => !value)} aria-expanded={languageOpen} aria-haspopup="menu">
            <span className="language-flag">{selectedLanguage.flag}</span>
            <span><small>Learning</small><strong>{selectedLanguage.label}</strong></span>
            <ChevronDown size={15} />
          </button>
          {languageOpen ? <div className="language-menu" role="menu">{[
            { code: "en", flag: "🇬🇧", label: "English" },
            { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
            { code: "zh", flag: "🇨🇳", label: "中文" },
          ].map((language) => <button type="button" role="menuitem" className={cn("language-menu-item", selectedLanguage.code === language.code && "language-menu-item-active")} key={language.code} onClick={() => { setSelectedLanguage(language); setLanguageOpen(false); notify(`${language.label} learning path selected.`); }}><span>{language.flag}</span>{language.label}</button>)}</div> : null}
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {primaryNav.map((item) => <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={close} />)}
          <p className="nav-label nav-label-spaced">Personal</p>
          {secondaryNav.map((item) => <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={close} />)}
        </nav>

        <div className="sidebar-bottom">
          <Link href="/app/settings" onClick={close} className={cn("nav-link", isActive("/app/settings") && "nav-link-active")}><Settings size={17} /><span>{t("nav.settings")}</span></Link>
          <Link href="/help" onClick={close} className="nav-link"><CircleHelp size={17} /><span>Help center</span></Link>
          <button type="button" className="profile-mini" onClick={() => router.push("/app/settings")} aria-label="Open profile settings">
            <span className="avatar avatar-small">Q</span>
            <span><strong>Quyến Nguyễn</strong><small>Academic learner</small></span>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>

      {mobileOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={close} /> : null}

      <main className="app-main">
        <header className="app-topbar">
          <button type="button" className="mobile-menu icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <button type="button" className="command-trigger" onClick={() => router.push("/dictionary")}><Search size={17} /><span>Search words, lessons, notes…</span><kbd>⌘ K</kbd></button>
          <div className="topbar-actions"><Link href="/app/progress" className="streak-chip" aria-label="Open progress and streak"><Flame size={16} fill="currentColor" /><span>12</span><small>day streak</small></Link><ThemeToggle /><div className="notification-wrap"><button type="button" className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><span className="notification-dot" /><Bell size={17} /></button>{notificationsOpen ? <div className="notification-menu"><strong>Keep your rhythm</strong><p>You have words ready for review.</p><Link href="/app/flashcards" onClick={() => setNotificationsOpen(false)}>Open review queue <span>→</span></Link></div> : null}</div><button type="button" className="avatar avatar-button" onClick={() => router.push("/app/settings")} aria-label="Open profile settings">Q</button></div>
        </header>
        <div className="app-content">{children}</div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {primaryNav.slice(0, 5).map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.href} className={cn(isActive(item.href) && "mobile-nav-active")}><Icon size={19} /><span>{item.label}</span></Link>; })}
      </nav>
    </div>
  );
}
