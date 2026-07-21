"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Vault,
  BarChart3,
  Wallet,
  Zap,
  Menu,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/vaults", label: "Vaults", icon: Vault },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:scale-105 transition-transform">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg tracking-tight leading-none text-foreground">
            Budget-Wise
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] font-bold opacity-80">
            Smart Finance
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] transition-transform ${
                  !isActive && "group-hover:scale-110"
                }`}
              />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      {/* Bottom card */}
      <div className="space-y-4">
        <div className="rounded-2xl p-4 border border-[var(--primary)]/15 bg-gradient-to-br from-[var(--primary)]/5 to-transparent relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
          <div className="absolute -right-2 -top-2 w-16 h-16 bg-[var(--primary)]/10 blur-2xl group-hover:bg-[var(--primary)]/20 transition-all duration-500" />
          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
            Current Tier
          </p>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--primary)] drop-shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
            <span className="font-bold text-sm text-foreground">
              Sapphire Pro
            </span>
          </div>
        </div>
        <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]">
          <Zap className="h-4 w-4 mr-2" />
          <span className="text-sm uppercase tracking-tight">
            Upgrade to Pro
          </span>
        </Button>
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

  // Don't use this layout for auth pages
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-full flex-col border-r border-border/60 bg-card/80 backdrop-blur-sm p-6 shrink-0 z-20">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 lg:px-10 py-5 bg-card/80 backdrop-blur-sm border-b border-border/60 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6">
                <SidebarContent pathname={pathname} />
              </SheetContent>
            </Sheet>

            <div>
              <h2 className="font-display text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Welcome back, your financial sanctuary is ready.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-accent"
            >
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            </Button>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none group-hover:text-[var(--primary)] transition-colors">
                  Alex Mbuthia
                </p>
                <p className="text-xs text-[var(--primary)] font-medium mt-1">
                  Nairobi, KE
                </p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-[var(--primary)]/20 group-hover:border-[var(--primary)]/50 transition-all">
                <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
                  AM
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
