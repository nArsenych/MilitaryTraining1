"use client";

import { BarChart4, BookMarked, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { icon: Home,       label: "Головна сторінка", path: "/" },
  { icon: BookMarked, label: "Ваші курси",        path: "/instructor/courses" },
  { icon: BarChart4,  label: "Активність",        path: "/instructor/perfomance" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="max-sm:hidden flex flex-col w-60 bg-[#272523] border-r border-white/10 px-3 pt-6 pb-4">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-3">
        Меню
      </p>
      <nav className="flex flex-col gap-0.5">
        {routes.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
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
    </aside>
  );
};

export default Sidebar;
