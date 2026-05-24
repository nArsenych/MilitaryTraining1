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
    { href: "/",                             label: "Головна",             icon: Home },
    { href: "/users/profiles",               label: "Вигляд профілю",      icon: Eye },
    { href: `/users/profiles/${profile.id}`, label: "Редагування профілю", icon: UserCog },
    { href: "/users/change-credentials",      label: "Пароль / Email",       icon: KeyRound },
    ...(!isOrganization
      ? [{ href: "/my-courses", label: "Мої курси", icon: BookOpen }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#272523] border-r border-white/10 px-3 pt-6 pb-4">
      {/* profile chip */}
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
  );
};

export default ProfileSidebar;
