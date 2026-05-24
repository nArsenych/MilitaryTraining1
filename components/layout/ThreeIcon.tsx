"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Users, MapPin, Boxes } from "lucide-react";

const routes = [
  { icon: Boxes,   label: "Всі курси",   path: "/all" },
  { icon: Library, label: "Категорії",   path: "/categories" },
  { icon: Users,   label: "Організації", path: "/organizations" },
  { icon: MapPin,  label: "Міста",       path: "/cities" },
];

const ThreeIcon = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-center gap-20">
      {routes.map(({ icon: Icon, label, path }) => {
        const isActive = pathname.startsWith(path);
        return (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center p-4 rounded-lg transition-colors
              ${isActive
                ? "bg-[#FDAB04] hover:bg-[#FDAB04]/80"
                : "hover:bg-[#F1CDA6]/20"
              }`}
          >
            <Icon size={100} color="#ebac66" strokeWidth={1.4} />
            <span className="mt-2 text-lg font-medium text-[#ebac66]">{label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default ThreeIcon;
