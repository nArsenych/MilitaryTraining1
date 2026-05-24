"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, Clock, History, Home } from "lucide-react";

const routes = [
  { label: "Підтверджені",           href: "/my-courses/confirmed", icon: CheckCircle },
  { label: "Очікують підтвердження", href: "/my-courses/pending",   icon: Clock },
  { label: "Історія курсів",         href: "/my-courses/history",   icon: History },
];

const MyCoursesSideBar = () => {
  const pathname = usePathname();

  return (
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
  );
};

export default MyCoursesSideBar;
