"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Languages,
  LifeBuoy,
  LogOut,
  Menu,
  PanelLeftClose,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo, LogoMark } from "@/components/logo";
import { cn } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export type WorkspaceArea = "admin" | "instructor";

type NavItem = { href: string; label: string; icon: LucideIcon };

const SIDEBAR_STATE_KEY = "lingua.sidebar";

function readSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

const areaNav: Record<WorkspaceArea, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Platform overview", icon: LayoutDashboard },
    { href: "/admin/reviews", label: "Course review", icon: ClipboardCheck },
    { href: "/admin/users", label: "User management", icon: Users },
    { href: "/admin/courses", label: "Course catalog", icon: GraduationCap },
    { href: "/admin/languages", label: "Languages", icon: Languages },
  ],
  instructor: [
    { href: "/instructor", label: "Studio overview", icon: LayoutDashboard },
    { href: "/instructor/courses", label: "My courses", icon: BookOpen },
    { href: "/instructor/students", label: "Students", icon: Users },
  ],
};

const areaMeta: Record<WorkspaceArea, { tag: string; title: string; blurb: string }> = {
  admin: { tag: "Admin console", title: "Admin Console", blurb: "Platform health, accounts, and catalog" },
  instructor: { tag: "Instructor studio", title: "Instructor Studio", blurb: "Author courses and follow learners" },
};

function canAccess(role: string | undefined, area: WorkspaceArea): boolean {
  if (role === "admin") return true;
  if (role === "instructor") return area === "instructor";
  return false;
}

export function WorkspaceShell({ area, children }: { area: WorkspaceArea; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const items = areaNav[area];
  const meta = areaMeta[area];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

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

  if (status !== "authenticated" || !user) {
    return (
      <div className="auth-gate flex flex-col items-center justify-center gap-4 min-h-screen">
        <LogoMark size="lg" animated={true} />
        <p className="text-sm font-medium text-[var(--muted)] animate-pulse">
          {status === "loading" ? "Đang mở không gian làm việc…" : "Đang chuyển đến màn hình đăng nhập…"}
        </p>
      </div>
    );
  }

  if (!canAccess(user.role, area)) {
    return (
      <div className="state-page flex flex-col items-center justify-center gap-4 min-h-screen px-6 text-center">
        <span className="empty-icon"><ShieldCheck size={26} /></span>
        <h1 className="text-xl font-bold">This workspace needs higher access</h1>
        <p className="max-w-md text-sm text-[var(--muted)]">
          Tài khoản <strong>{user.email}</strong> không có quyền truy cập khu vực này. Hãy liên hệ quản trị viên
          nếu bạn cần vai trò giảng viên hoặc admin.
        </p>
        <div className="flex gap-2">
          <Link href="/app/dashboard" className="button button-primary"><ArrowLeft size={15} /> Back to learning</Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => href === "/admin" || href === "/instructor"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const workspaces = [
    { href: "/app/dashboard", label: "Learning", icon: BookOpen, available: true },
    { href: "/instructor", label: "Studio", icon: GraduationCap, available: user.role === "instructor" || user.role === "admin" },
    { href: "/admin", label: "Admin", icon: ShieldCheck, available: user.role === "admin" },
  ].filter((workspace) => workspace.available);

  const avatarLetter = user.first_name.trim().slice(0, 1).toUpperCase() || "L";

  return (
    <div className={cn("app-frame", collapsed && "sidebar-collapsed")}>
      <aside className={cn("app-sidebar", mobileOpen && "app-sidebar-open")}>
        <div className="sidebar-brand flex items-center justify-between">
          <Logo size="sm" href="/" onClick={() => setMobileOpen(false)} animated={true} showText={!collapsed} />
          <button type="button" className="sidebar-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className={cn("ws-tag", `ws-tag-${area}`)} title={collapsed ? meta.tag : undefined}>
          <span className="ws-tag-dot" />
          <div><small>{meta.tag}</small><strong>{meta.blurb}</strong></div>
        </div>

        <nav className="sidebar-nav" aria-label={`${meta.title} navigation`}>
          <p className="nav-label">Workspace</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn("nav-link", isActive(item.href) && "nav-link-active")}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                <Icon size={17} strokeWidth={isActive(item.href) ? 2.4 : 1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="ws-switcher" role="group" aria-label="Switch workspace">
            {workspaces.map((workspace) => {
              const Icon = workspace.icon;
              const active = area === workspace.label.toLowerCase();
              return (
                <Link
                  key={workspace.href}
                  href={workspace.href}
                  className={cn("ws-switcher-item", active && "ws-switcher-item-active")}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? `${workspace.label} workspace` : undefined}
                >
                  <Icon size={15} />
                  <span>{workspace.label}</span>
                </Link>
              );
            })}
          </div>
          <Link href="/app/settings" className="nav-link" title={collapsed ? "Settings" : undefined}><Settings size={17} /><span>Settings</span></Link>
          <Link href="/help" className="nav-link" title={collapsed ? "Help center" : undefined}><LifeBuoy size={17} /><span>Help center</span></Link>
          <div className="profile-mini profile-mini-static" title={collapsed ? `${user.first_name} · ${user.email}` : undefined}>
            <span className="avatar avatar-small">{avatarLetter}</span>
            <span><strong>{user.first_name}</strong><small>{user.email}</small></span>
            <span className={cn("role-chip", `role-chip-${user.role}`)}>{user.role}</span>
          </div>
          <button type="button" className="nav-link nav-link-button auth-signout" title={collapsed ? "Sign out" : undefined} onClick={() => void logout()}><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>

      {mobileOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}

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
          <div className="ws-topbar-title">
            <span className={cn("ws-badge", `ws-badge-${area}`)}>{meta.tag}</span>
            <strong>{meta.title}</strong>
          </div>
          <div className="topbar-actions">
            <div className="ws-context-wrap">
              <button type="button" className="ws-context-button" onClick={() => setSwitcherOpen((value) => !value)} aria-expanded={switcherOpen}>
                <span className="avatar avatar-small">{avatarLetter}</span>
                <span className="ws-context-name">{user.first_name}</span>
                <ChevronDown size={14} />
              </button>
              {switcherOpen ? (
                <div className="ws-context-menu">
                  <p className="ws-context-email">{user.email}</p>
                  {workspaces.map((workspace) => (
                    <Link key={workspace.href} href={workspace.href} onClick={() => setSwitcherOpen(false)}>{workspace.label}</Link>
                  ))}
                  <button type="button" onClick={() => { setSwitcherOpen(false); void logout(); }}>Sign out</button>
                </div>
              ) : null}
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href} className={cn(isActive(item.href) && "mobile-nav-active")}>
              <Icon size={19} /><span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
