"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import EdrpouVerification from "@/components/custom/EdrpouVerification";
import { Building2, User, ArrowLeft } from "lucide-react";

const SelectAccountType = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<"select" | "org-edrpou">("select");
  const [edrpou, setEdrpou] = useState("");
  const [edrpouPassed, setEdrpouPassed] = useState(false);
  const [edrpouBlocked, setEdrpouBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const proceed = async (isOrganization: boolean, edrpouCode?: string) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error("Unauthorized");

      const body: Record<string, unknown> = { isOrganization };
      if (edrpouCode) body.edrpou = edrpouCode;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed");
      router.push("/users/create-profile");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "org-edrpou") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#302E2B] px-4">
        <div className="w-full max-w-md bg-[#3D3A36] rounded-2xl p-8 border border-white/10">
          <button
            onClick={() => { setStep("select"); setEdrpou(""); setEdrpouPassed(false); setEdrpouBlocked(false); }}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Назад
          </button>

          <h1 className="text-xl font-bold text-white mb-1">Реєстрація організації</h1>
          <p className="text-sm text-white/40 mb-6">
            Введіть код ЄДРПОУ для перевірки організації перед реєстрацією.
          </p>

          <EdrpouVerification
            edrpou={edrpou}
            setEdrpou={(val) => {
              setEdrpou(val);
              setEdrpouPassed(false);
              setEdrpouBlocked(false);
            }}
            onVerified={(result) => {
              setEdrpouBlocked(result.hasSanctions);
              // both conditions must be true: org found in registry AND no sanctions
              setEdrpouPassed(result.exists && !result.hasSanctions);
            }}
          />

          <Button
            className="w-full mt-6 bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold disabled:opacity-40"
            disabled={!edrpouPassed || edrpouBlocked || isLoading}
            onClick={() => proceed(true, edrpou)}
          >
            {isLoading ? "Завантаження…" : "Продовжити як організація"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#302E2B] gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Оберіть тип облікового запису</h1>
        <p className="text-white/40 text-sm mt-2">Цей вибір не можна змінити пізніше</p>
      </div>

      <div className="flex gap-5">
        <button
          onClick={() => setStep("org-edrpou")}
          disabled={isLoading}
          className="flex flex-col items-center gap-4 p-8 w-44 rounded-2xl bg-[#3D3A36] border border-white/10 hover:border-[#FDAB04]/60 hover:bg-white/5 transition-all"
        >
          <Building2 size={36} className="text-[#FDAB04]" />
          <span className="font-semibold text-white">Організація</span>
        </button>

        <button
          onClick={() => proceed(false)}
          disabled={isLoading}
          className="flex flex-col items-center gap-4 p-8 w-44 rounded-2xl bg-[#3D3A36] border border-white/10 hover:border-[#FDAB04]/60 hover:bg-white/5 transition-all"
        >
          <User size={36} className="text-[#FDAB04]" />
          <span className="font-semibold text-white">Клієнт</span>
        </button>
      </div>
    </div>
  );
};

export default SelectAccountType;
