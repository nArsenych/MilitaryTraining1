"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, Clock, History } from "lucide-react";

const MyCoursesSideBar = () => {
  const pathname = usePathname();

  const routes = [
    {
      label: "Підтверджені",
      href: "/my-courses/confirmed",
      icon: CheckCircle,
    },
    {
      label: "Очікують підтвердження",
      href: "/my-courses/pending",
      icon: Clock,
    },
    {
      label: "Історія курсів",
      href: "/my-courses/history",
      icon: History,
    },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r shadow-md px-3 text-sm font-medium bg-[#4E4C4B] pt-4">
      <h1 className="text-lg font-bold text-center mb-4 text-[#ebac66]">
        Мої курси
      </h1>
      
      <Link href="/" className="p-3 rounded-lg hover:bg-[#ebac66] mt-2">
        Home
      </Link>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={`p-3 rounded-lg hover:bg-[#ebac66] mt-2 flex items-center gap-2 ${
            pathname === route.href
              ? "bg-[#ebac66] text-black"
              : "text-white"
          }`}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </div>
  );
};

export default MyCoursesSideBar;