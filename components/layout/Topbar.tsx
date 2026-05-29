"use client"

import Link from "next/link"
import { Search, Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/UseProfile";

const Topbar = () => {
    const { profileId, isOrganization, isAdmin, isLoading: profileLoading } = useProfile();
    const { isSignedIn, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSearch = () => {
        if (searchInput.trim() !== "") {
            router.push(`/search?query=${searchInput}`);
        }
        setSearchInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    // Fix #3: extracted from nested ternary to avoid linting error
    const renderDesktopNavLinks = () => {
        if (authLoading) {
            return (
                <Button variant="outline" disabled className="rounded-full border-white/20 text-white/40 bg-transparent px-5">
                    &nbsp;
                </Button>
            );
        }
        if (!isSignedIn) {
            return (
                <Link href="/sign-in">
                    <Button className="rounded-full bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold px-5">
                        Увійти
                    </Button>
                </Link>
            );
        }
        if (profileLoading) {
            return (
                <Button variant="outline" disabled className="rounded-full border-white/30 text-white bg-transparent">
                    Завантаження…
                </Button>
            );
        }
        return (
            <>
                {isAdmin && (
                    <Link
                        href="/admin"
                        className="text-sm font-medium text-[#FDAB04] hover:text-[#ebac66] transition-colors"
                    >
                        Адмін-панель
                    </Link>
                )}
                {!isAdmin && isOrganization && (
                    <Link
                        href="/instructor/courses"
                        className="text-sm font-medium text-white/80 hover:text-[#FDAB04] transition-colors"
                    >
                        Ваші курси
                    </Link>
                )}
                {!isAdmin && !isOrganization && (
                    <Link
                        href="/my-courses"
                        className="text-sm font-medium text-white/80 hover:text-[#FDAB04] transition-colors"
                    >
                        Мої курси
                    </Link>
                )}
                {!isAdmin && (
                    <Link href={`/users/profiles/${profileId}`}>
                        <Button className="rounded-full bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold px-5">
                            Мій профіль
                        </Button>
                    </Link>
                )}
            </>
        );
    };

    return (
        <div
            className="relative w-full h-screen bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: `url('/logo1.jpg')` }}
        >
            {/* gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#302E2B]" />

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Fix #1 & #2: role + tabIndex + onKeyDown on the clickable backdrop */}
                    <button
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm w-full h-full"
                        aria-label="Закрити меню"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute top-0 right-0 h-full w-72 bg-[#272523] flex flex-col p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[#FDAB04] font-bold text-lg tracking-widest uppercase">MilitaryTraning</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white p-1">
                                <X size={22} />
                            </button>
                        </div>

                        {/* mobile search */}
                        <div className="flex items-center bg-white/10 border border-white/20 rounded-full overflow-hidden mb-6">
                            <input
                                className="bg-transparent text-sm text-white placeholder-white/60 outline-none pl-4 pr-2 py-2.5 flex-1"
                                placeholder="Пошук курсів…"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="bg-[#FDAB04] hover:bg-[#ebac66] transition-colors px-4 self-stretch flex items-center"
                                disabled={searchInput.trim() === ""}
                                onClick={() => { handleSearch(); setMobileMenuOpen(false); }}
                            >
                                <Search className="h-4 w-4 text-black" />
                            </button>
                        </div>

                        {/* mobile nav links */}
                        <nav className="flex flex-col gap-1">
                            {!authLoading && isSignedIn && !profileLoading && (
                                <>
                                    {isAdmin && (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}
                                            className="px-3 py-3 rounded-xl text-sm font-medium text-[#FDAB04] hover:bg-[#FDAB04]/10 transition-colors">
                                            Адмін-панель
                                        </Link>
                                    )}
                                    {!isAdmin && isOrganization && (
                                        <Link href="/instructor/courses" onClick={() => setMobileMenuOpen(false)}
                                            className="px-3 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/8 transition-colors">
                                            Ваші курси
                                        </Link>
                                    )}
                                    {!isAdmin && !isOrganization && (
                                        <Link href="/my-courses" onClick={() => setMobileMenuOpen(false)}
                                            className="px-3 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/8 transition-colors">
                                            Мої курси
                                        </Link>
                                    )}
                                    {!isAdmin && (
                                        <Link href={`/users/profiles/${profileId}`} onClick={() => setMobileMenuOpen(false)}
                                            className="mt-1 px-3 py-3 rounded-xl bg-[#FDAB04] text-black text-sm font-semibold text-center transition-colors">
                                            Мій профіль
                                        </Link>
                                    )}
                                </>
                            )}
                            {!authLoading && !isSignedIn && (
                                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-3 rounded-xl bg-[#FDAB04] text-black text-sm font-semibold text-center">
                                    Увійти
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            )}

            {/* nav bar */}
            <div className="relative z-10 flex justify-between items-center px-5 md:px-8 py-5">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-[#FDAB04] font-bold text-xl tracking-widest uppercase hover:opacity-80 transition-opacity">
                        MilitaryTraning
                    </Link>
                </div>

                {/* hamburger — mobile only */}
                <button
                    className="md:hidden text-white/80 hover:text-white p-1 transition-colors"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Відкрити меню"
                >
                    <Menu size={26} />
                </button>

                <div className="hidden md:flex items-center gap-6">
                    {/* search */}
                    <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full overflow-hidden">
                        <input
                            className="bg-transparent text-sm text-white placeholder-white/60 outline-none pl-5 pr-3 py-2.5 w-56"
                            placeholder="Пошук курсів…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="bg-[#FDAB04] hover:bg-[#ebac66] transition-colors px-4 self-stretch disabled:opacity-40 flex items-center"
                            disabled={searchInput.trim() === ""}
                            onClick={handleSearch}
                        >
                            <Search className="h-4 w-4 text-black" />
                        </button>
                    </div>

                    {/* links */}
                    <div className="flex items-center gap-5">
                        {renderDesktopNavLinks()}
                    </div>
                </div>
            </div>

            {/* hero text */}
            <div className="relative z-10 flex flex-col justify-center h-[70%] px-12 md:px-20">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#FDAB04] uppercase mb-4">
                    Платформа військової підготовки
                </p>
                <h1
                    className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
                    style={{ fontFamily: "KyivType Sans" }}
                >
                    КУРСИ ПО<br />
                    <span className="text-[#FDAB04]">ВІЙСЬКОВІЙ</span><br />
                    ПІДГОТОВЦІ
                </h1>
                <div className="mt-8 w-20 h-1 bg-[#FDAB04] rounded-full" />
            </div>
        </div>
    );
};

export default Topbar;
