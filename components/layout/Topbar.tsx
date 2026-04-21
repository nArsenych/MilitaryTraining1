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

    const isLoading = profileLoading || authLoading;

    return (
        <>
            <div
                className="relative w-full h-screen bg-cover bg-center"
                style={{
                    backgroundImage: `url('/logo1.jpg')`,
                }}
            >
                <div className="relative flex justify-between items-center p-4">
                    <div className="max-md:hidden w-full flex justify-between items-center gap-4">
                        <div className="max-md:hidden w-[400px] rounded-full flex">
                            <input
                                className="flex-grow bg-[#F1CDA6] rounded-l-full border-none outline-none text-sm pl-4 py-3 text-black"
                                placeholder="Пошук курсів"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <button
                                className="bg-[#EBAC66] rounded-r-full border-none outline-none cursor-pointer px-4 py-3 hover:bg-[#FDAB04]/80"
                                disabled={searchInput.trim() === ""}
                                onClick={handleSearch}
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-6 ml-auto">
                            <div className="max-sm:hidden flex gap-6">
                                {isSignedIn && isOrganization && (
                                    <Link
                                        href="/instructor/courses"
                                        className="text-sm font-medium text-[#ebac66] hover:text-[#FDAB04]"
                                    >
                                        Ваші курси
                                    </Link>
                                )}
                            </div>

                            {isSignedIn ? (
                                isLoading ? (
                                    <Button disabled>Завантаження...</Button>
                                ) : (
                                    <Link href={`/users/profiles/${profileId}`}>
                                        <Button>Мій профіль</Button>
                                    </Link>
                                )
                            ) : (
                                <Link href="/sign-in">
                                    <Button>Увійти</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-[17vh] ml-[5vh]">
                    <p
                        className="text-6xl text-[#EBAC66] font-sans leading-relaxed tracking-wider"
                        style={{ fontFamily: "KyivType Sans", wordSpacing: "0.5rem", whiteSpace: "pre-wrap" }}
                    >
                        КУРСИ ПО <br />
                        ВІЙСЬКОВІЙ ПІДГОТОВЦІ
                    </p>
                </div>
            </div>
        </>
    );
};

export default Topbar;
