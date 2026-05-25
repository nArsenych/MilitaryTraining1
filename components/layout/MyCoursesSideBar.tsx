"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, Clock, History, Home } from "lucide-react";

const routes = [
  { label: "Підтверджені",      href: "/my-courses/confirmed", icon: CheckCircle },
  { label: "Очікують",          href: "/my-courses/pending",   icon: Clock },
  { label: "Історія",           href: "/my-courses/history",   icon: History },
];

const MyCoursesSideBar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#272523] border-r border-white/10 px-3 pt-6 pb-4">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-3">
          Мої курси
        </p>
        <nav className="flex flex-col gap-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all"
          >
            <Home size={16} className="text-white/40" />
            Головна
          </Link>

          <div className="my-1.5 mx-2 border-t border-white/10" />

          {routes.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-[#272523] border-t border-white/10">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-white/45 hover:text-white/80 transition-colors"
        >
          <Home size={20} />
          Головна
        </Link>
        {routes.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors
                ${isActive ? "text-[#FDAB04]" : "text-white/45 hover:text-white/80"}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default MyCoursesSideBar;
