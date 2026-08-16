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
  LogOut,
  Menu,
  Mic2,
  NotebookPen,
  PanelLeftClose,
  PencilLine,
  Search,
  Settings,
  StretchHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActionFeedback } from "@/components/action-feedback";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";

type NavItem = { href: string; label: string; icon: LucideIcon; shortcut?: string };

const SIDEBAR_STATE_KEY = "lingua.sidebar";

function readSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

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

function NavLink({ item, active, collapsed, onNavigate }: { item: NavItem; active: boolean; collapsed: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn("nav-link", active && "nav-link-active")}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      <Icon size={17} strokeWidth={active ? 2.4 : 1.9} />
      <span>{t(`nav.${item.label === "AI Tutor" ? "aiTutor" : item.label.toLowerCase()}`)}</span>
      {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
    </Link>
  );
}

import { Logo, LogoMark } from "@/components/logo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({ code: "en", flag: "🇬🇧", label: "English" });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { notify } = useActionFeedback();
  const { status: authStatus, user, logout } = useAuth();
  const isActive = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setMobileOpen(false);

  useEffect(() => {
    setCollapsed(readSidebarCollapsed());
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_STATE_KEY, next ? "collapsed" : "expanded");
      } catch {
        // Storage can be unavailable in private mode; the toggle still works.
      }
      return next;
    });
  };

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

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authStatus, pathname, router]);

  if (authStatus !== "authenticated" || !user) {
    return (
      <div className="auth-gate flex flex-col items-center justify-center gap-4 min-h-screen">
        <LogoMark size="lg" animated={true} />
        <p className="text-sm font-medium text-[var(--muted)] animate-pulse">
          {authStatus === "loading" ? "Đang chuẩn bị không gian học tập của bạn…" : "Đang chuyển đến màn hình đăng nhập…"}
        </p>
      </div>
    );
  }

  const avatarLetter = user.first_name.trim().slice(0, 1).toUpperCase() || "L";

  return (
    <div className={cn("app-frame", collapsed && "sidebar-collapsed")}>
      <aside className={cn("app-sidebar", mobileOpen && "app-sidebar-open")}>
        <div className="sidebar-brand flex items-center justify-between">
          <Logo size="sm" href="/" onClick={close} animated={true} showText={!collapsed} />
          <button type="button" className="sidebar-close icon-button" onClick={close} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="language-switcher-wrap">
          <button
            type="button"
            className="language-switcher"
            onClick={() => setLanguageOpen((value) => !value)}
            aria-expanded={languageOpen}
            aria-haspopup="menu"
            title={collapsed ? selectedLanguage.label : undefined}
          >
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
          {primaryNav.map((item) => <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onNavigate={close} />)}
          <p className="nav-label nav-label-spaced">Personal</p>
          {secondaryNav.map((item) => <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onNavigate={close} />)}
        </nav>

        <div className="sidebar-bottom">
          {user.role === "instructor" || user.role === "admin" ? (
            <div className="ws-switcher" role="group" aria-label="Switch workspace">
              <span className="ws-switcher-item ws-switcher-item-active" title={collapsed ? "Learning" : undefined}><BookOpen size={15} /><span>Learning</span></span>
              <Link href="/instructor" className="ws-switcher-item" title={collapsed ? "Studio" : undefined}><Mic2 size={15} /><span>Studio</span></Link>
              {user.role === "admin" ? <Link href="/admin" className="ws-switcher-item" title={collapsed ? "Admin" : undefined}><Settings size={15} /><span>Admin</span></Link> : <span className="ws-switcher-item" style={{ opacity: 0.35 }}><Settings size={15} /><span>Admin</span></span>}
            </div>
          ) : null}
          <Link href="/app/settings" onClick={close} title={collapsed ? "Settings" : undefined} className={cn("nav-link", isActive("/app/settings") && "nav-link-active")}><Settings size={17} /><span>{t("nav.settings")}</span></Link>
          <Link href="/help" onClick={close} title={collapsed ? "Help center" : undefined} className="nav-link"><CircleHelp size={17} /><span>Help center</span></Link>
          <button type="button" className="profile-mini" onClick={() => router.push("/app/settings")} aria-label="Open profile settings" title={collapsed ? user.first_name : undefined}>
            <span className="avatar avatar-small">{avatarLetter}</span>
            <span><strong>{user.first_name}</strong><small>{user.email}</small></span>
            <ChevronDown size={14} />
          </button>
          <button type="button" className="nav-link nav-link-button auth-signout" title={collapsed ? "Sign out" : undefined} onClick={() => { void logout(); close(); }}><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>

      {mobileOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={close} /> : null}

      <button
        type="button"
        className="sidebar-split-toggle"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
        title={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
      >
        <PanelLeftClose size={16} />
      </button>

      <main className="app-main">
        <header className="app-topbar">
          <button type="button" className="mobile-menu icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <button type="button" className="command-trigger" onClick={() => router.push("/dictionary")}><Search size={17} /><span>Search words, lessons, notes…</span><kbd>⌘ K</kbd></button>
          <div className="topbar-actions"><Link href="/app/progress" className="streak-chip" aria-label="Open progress and streak"><Flame size={16} fill="currentColor" /><span>12</span><small>day streak</small></Link><ThemeToggle /><div className="notification-wrap"><button type="button" className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><span className="notification-dot" /><Bell size={17} /></button>{notificationsOpen ? <div className="notification-menu"><strong>Keep your rhythm</strong><p>You have words ready for review.</p><Link href="/app/flashcards" onClick={() => setNotificationsOpen(false)}>Open review queue <span>→</span></Link></div> : null}</div><button type="button" className="avatar avatar-button" onClick={() => router.push("/app/settings")} aria-label="Open profile settings">{avatarLetter}</button></div>
        </header>
        <div className="app-content">{children}</div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {primaryNav.slice(0, 5).map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.href} className={cn(isActive(item.href) && "mobile-nav-active")}><Icon size={19} /><span>{item.label}</span></Link>; })}
      </nav>
    </div>
  );
}
