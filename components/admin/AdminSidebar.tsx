"use client";

import { LayoutDashboard, Users, BookOpen, AlertTriangle, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const routes = [
  { icon: LayoutDashboard, label: "Дашборд",     path: "/admin" },
  { icon: Users,           label: "Користувачі", path: "/admin/users" },
  { icon: BookOpen,        label: "Курси",        path: "/admin/courses" },
  { icon: AlertTriangle,   label: "Скарги",       path: "/admin/complaints" },
  { icon: Home,            label: "Головна",      path: "/" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#272523] border-r border-white/10 px-3 pt-6 pb-4">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-1">
          Адмін-панель
        </p>
        <p className="text-[9px] text-red-400/60 uppercase tracking-widest px-2 mb-3">
          MilitaryTraining
        </p>
        <nav className="flex flex-col gap-0.5">
          {routes.map(({ icon: Icon, label, path }) => {
            const isActive =
              path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
            return (
              <Link
                key={path}
                href={path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-[#FDAB04] text-black shadow-sm shadow-[#FDAB04]/30"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                  }`}
              >
                <Icon size={16} className={isActive ? "text-black" : "text-white/40"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all mt-2"
        >
          <LogOut size={16} />
          Вийти
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-[#272523] border-t border-white/10">
        {routes.map(({ icon: Icon, label, path }) => {
          const isActive =
            path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors
                ${isActive ? "text-[#FDAB04]" : "text-white/45 hover:text-white/80"}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-white/35 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          Вийти
        </button>
      </nav>
    </>
  );
};

export default AdminSidebar;
