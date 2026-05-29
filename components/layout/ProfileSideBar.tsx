"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { ClientProfile, OrganizationProfile } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, Home, Eye, UserCog, BookOpen, KeyRound } from "lucide-react";

interface ProfileSidebarProps {
  profile: ClientProfile | OrganizationProfile;
  isOrganization: boolean;
}

const ProfileSidebar = ({ profile, isOrganization }: ProfileSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    if (pathname === "/") router.push("/users/profiles");
  }, [pathname, router]);

  const links = [
    { href: "/",                             label: "Головна",    icon: Home },
    { href: "/users/profiles",               label: "Профіль",    icon: Eye },
    { href: `/users/profiles/${profile.id}`, label: "Редагувати", icon: UserCog },
    { href: "/users/change-credentials",     label: "Пароль",     icon: KeyRound },
    ...(isOrganization
      ? []
      : [{ href: "/my-courses", label: "Курси", icon: BookOpen }]),
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#272523] border-r border-white/10 px-3 pt-6 pb-4">
        <div className="mx-2 mb-4 px-3 py-2.5 rounded-xl bg-[#FDAB04]/10 border border-[#FDAB04]/20">
          <p className="text-[10px] text-[#FDAB04]/50 uppercase tracking-wider">Профіль</p>
          <p className="text-sm font-semibold text-[#FDAB04] truncate mt-0.5">
            {profile.full_name || "—"}
          </p>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {links.map(({ href, label, icon: Icon }) => {
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
        {links.map(({ href, label, icon: Icon }) => {
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

export default ProfileSidebar;
