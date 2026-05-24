"use client"

import Link from "next/link"
import { Search } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/UseProfile";

const Topbar = () => {
    const { profileId, isOrganization, isLoading: profileLoading } = useProfile();
    const { isSignedIn, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");

    const handleSearch = () => {
        if (searchInput.trim() !== "") {
            router.push(`/search?query=${searchInput}`);
        }
        setSearchInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div
            className="relative w-full h-screen bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: `url('/logo1.jpg')` }}
        >
            {/* gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#302E2B]" />

            {/* nav bar */}
            <div className="relative z-10 flex justify-between items-center px-8 py-5">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-[#FDAB04] font-bold text-xl tracking-widest uppercase hover:opacity-80 transition-opacity">
                        MilitaryTraning
                    </Link>
                </div>

                <div className="max-md:hidden flex items-center gap-6">
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
                        {authLoading ? (
                            <Button variant="outline" disabled className="rounded-full border-white/20 text-white/40 bg-transparent px-5">
                                &nbsp;
                            </Button>
                        ) : isSignedIn ? (
                            profileLoading ? (
                                <Button variant="outline" disabled className="rounded-full border-white/30 text-white bg-transparent">
                                    Завантаження…
                                </Button>
                            ) : (
                                <>
                                    {isOrganization && (
                                        <Link
                                            href="/instructor/courses"
                                            className="text-sm font-medium text-white/80 hover:text-[#FDAB04] transition-colors"
                                        >
                                            Ваші курси
                                        </Link>
                                    )}
                                    {!isOrganization && (
                                        <Link
                                            href="/my-courses"
                                            className="text-sm font-medium text-white/80 hover:text-[#FDAB04] transition-colors"
                                        >
                                            Мої курси
                                        </Link>
                                    )}
                                    <Link href={`/users/profiles/${profileId}`}>
                                        <Button className="rounded-full bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold px-5">
                                            Мій профіль
                                        </Button>
                                    </Link>
                                </>
                            )
                        ) : (
                            <Link href="/sign-in">
                                <Button className="rounded-full bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold px-5">
                                    Увійти
                                </Button>
                            </Link>
                        )}
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
