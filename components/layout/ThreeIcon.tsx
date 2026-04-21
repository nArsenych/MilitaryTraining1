"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Users, MapPin, Boxes } from 'lucide-react';

const ThreeIcon = () => {
  const pathname = usePathname();

  const ThreeIconRoutes = [
    {
      icon: <Boxes size={100} color="#ebac66" strokeWidth={1.3}/>,
      label: "Всі курси",
      path: "/all"
    },
    {
      icon: <Library size={100} color="#ebac66" strokeWidth={1.5}/>,
      label: "Категорії",
      path: "/categories"
    },
    {
      icon: <Users  size={100} color="#ebac66" strokeWidth={1.5}/>,
      label: "Організації",
      path: "/organizations",
    },
    {
      icon: <MapPin  size={100} color="#ebac66" strokeWidth={1.5}/>,
      label: "Міста",
      path: "/cities",
    },
  ];

  return (
    <div className="flex justify-center gap-20">
      {ThreeIconRoutes.map((route) => (
        <Link
          href={route.path}
          key={route.path}
          className={`flex flex-col items-center p-4 rounded-lg hover:bg-[#F1CDA6] transition-colors
            ${pathname.startsWith(route.path) && "bg-[#FDAB04] hover:bg-[#FDAB04]/80"}
          `}
        >
          <div className="text-4xl">
            {route.icon}
          </div>
          <span className="mt-2 text-lg font-medium text-[#ebac66]">
            {route.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default ThreeIcon;