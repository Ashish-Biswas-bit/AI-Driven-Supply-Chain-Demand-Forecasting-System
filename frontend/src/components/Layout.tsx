import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard, Package, TrendingUp, Bell, ShoppingCart, Menu, Upload,
  LogOut, User as UserIcon, Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/import-data", label: "Import Data", icon: Upload },
];

const bottomNavItems = [
  { href: "/subscribe", label: "Subscription", icon: Zap },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-60 bg-brand-700 text-white flex flex-col z-30 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white font-bold text-xs">
              SC
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">AI Supply Chain</div>
              <div className="text-xs text-white/60 mt-0.5">Demand Forecasting</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = router.pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="px-3 py-2 border-t border-white/10">
          {bottomNavItems.map(({ href, label, icon: Icon }) => {
            const active = router.pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* User info at bottom of sidebar */}
        {user && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-white truncate">{user.name}</div>
                <div className="text-[11px] text-white/50 truncate">{user.email}</div>
                {/* Subscription badge */}
                {user.subscription_plan && (
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${
                      user.subscription_status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {user.subscription_plan === 'free_trial' ? 'Trial' : user.subscription_plan}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between lg:px-8">
          <button
            type="button"
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="text-sm font-medium text-gray-700 hidden lg:block">
            {navItems.find((n) => router.pathname.startsWith(n.href))?.label || "Dashboard"}
          </div>

          <div className="flex items-center gap-3">
            {/* User menu (desktop) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                  {user ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name || "User"}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 capitalize">
                        {user?.role}
                      </span>
                      {user?.subscription_plan && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          user.subscription_status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {user.subscription_plan === 'free_trial' ? 'Free Trial' : user.subscription_plan}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
