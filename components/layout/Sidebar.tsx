"use client";

import { BarChart4, BookMarked, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
    const pathname = usePathname();

    const sidebarRoutes = [
        { 
            icon: Home, 
            label: "Головна сторінка", 
            path: "/" 
        },
        { 
            icon: BookMarked, 
            label: "Ваші курси", 
            path: "/instructor/courses" 
        },
        {
            icon: BarChart4,
            label: "Активність",
            path: "/instructor/perfomance",
        },
    ];

    return (
        <div className="max-sm:hidden flex flex-col w-64 border-r shadow-md px-3 gap-4 text-sm font-medium h-screen bg-[#4E4C4B] pt-4">
            {sidebarRoutes.map((route) => {
                const isActive = pathname === route.path || 
                    (route.path !== "/" && pathname.startsWith(route.path));
                const Icon = route.icon;
                
                return (
                    <Link
                        href={route.path}
                        key={route.path}
                        className={`flex items-center gap-4 p-3 rounded-lg hover:bg-[#FFF8EB] transition-colors
                            ${isActive ? "text-[#FDAB04]" : "text-black"}
                        `}
                    >
                        <Icon 
                            size={24} 
                            className={isActive ? "text-[#FDAB04]" : "text-black"} 
                        /> 
                        <span>{route.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}

export default Sidebar;
