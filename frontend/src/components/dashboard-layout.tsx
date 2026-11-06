"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Vault,
  BarChart3,
  Wallet,
  LogOut,
  Bell,
  ChevronRight,
  User,
  Settings,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, description: "Overview & scores" },
  { href: "/income", label: "Income", icon: TrendingUp, description: "Track earnings" },
  { href: "/expenses", label: "Expenses", icon: Receipt, description: "Monitor spending" },
  { href: "/vaults", label: "Vaults", icon: Vault, description: "Manage buckets" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, description: "Trends & insights" },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 mx-2 rounded-sm text-sm font-medium transition-all duration-150 relative ${
        isActive
          ? "bg-white/15 text-white"
          : "text-white/60 hover:bg-white/8 hover:text-white/90"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#E8A020] rounded-r-full" />
      )}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-sm transition-colors ${
          isActive ? "bg-white/10" : "group-hover:bg-white/5"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className="flex-1 font-medium">{item.label}</span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/40" />}
    </Link>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--sidebar)" }}>
      {/* Logo / Brand */}
      <div
        className="flex items-center gap-3 px-6 py-5 border-b shrink-0"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div
          className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="font-display font-bold text-base leading-tight text-white truncate"
          >
            Budget-Wise
          </h1>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--sidebar-muted)" }}>
            Smart Finance Platform
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav section label */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--sidebar-muted)" }}>
          Main Menu
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto space-y-0.5 sidebar-scroll pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            onClick={onClose}
          />
        ))}

        <div
          className="mx-6 my-4 border-t"
          style={{ borderColor: "var(--sidebar-border)" }}
        />

        <div className="px-6 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--sidebar-muted)" }}>
            System
          </p>
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-sm text-sm text-white/50 hover:bg-white/8 hover:text-white/80 transition-all"
              onClick={onClose}
            >
              <Icon className="h-4 w-4 ml-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card at bottom */}
      <div
        className="shrink-0 mx-3 mb-4 p-3 rounded-sm"
        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "var(--accent)" }}
          >
            BW
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Budget-Wise User</p>
            <p className="text-[10px] truncate" style={{ color: "var(--sidebar-muted)" }}>
              Nairobi, Kenya
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-sm hover:bg-white/10 transition-colors"
            title="Sign out"
            style={{ color: "var(--sidebar-muted)" }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount] = useState(2);

  // Don't use this layout for auth pages
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  const currentPage = navItems.find((n) => n.href === pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 z-20"
        style={{ width: "var(--sidebar-width)" }}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "var(--sidebar-width)" }}
      >
        <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header — Carbon-style */}
        <header
          className="shrink-0 flex items-center justify-between px-6 lg:px-8 border-b bg-white z-10"
          style={{ borderColor: "var(--border)", height: "56px" }}
        >
          {/* Left: Mobile menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 rounded-sm hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Budget-Wise</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {currentPage?.label || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            {/* Notification button */}
            <button className="relative p-2 rounded-sm hover:bg-muted transition-colors">
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
              {notifCount > 0 && <span className="notif-badge" />}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* User button */}
            <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-sm hover:bg-muted transition-colors">
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "var(--primary)" }}
              >
                BW
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-tight">My Account</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Nairobi, KE</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page title bar — Carbon-style */}
        <div
          className="shrink-0 px-6 lg:px-8 py-4 bg-white border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold text-foreground leading-tight">
            {currentPage?.label || "Dashboard"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentPage?.description || "Financial overview and metrics"}
          </p>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-6 max-w-screen-xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
