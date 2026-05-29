"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  let resendLabel: string;
  if (resent) {
    resendLabel = "Лист надіслано";
  } else if (resending) {
    resendLabel = "Надсилання...";
  } else {
    resendLabel = "Надіслати повторно";
  }

  const resend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      toast.success("Лист надіслано повторно");
    } catch {
      toast.error("Помилка. Спробуйте ще раз.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#302E2B] px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <div className="p-5 rounded-full bg-[#FDAB04]/10 border border-[#FDAB04]/20">
          <Mail size={48} className="text-[#FDAB04]" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white mb-2">Перевірте вашу пошту</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Ми надіслали лист на{" "}
            {email && <span className="text-white font-medium">{email}</span>}.
            {" "}Натисніть посилання у листі, щоб підтвердити акаунт.
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-sm text-white/60 text-left leading-relaxed w-full">
          <p className="font-medium text-white/80 mb-1">Не отримали лист?</p>
          <p>Перевірте папку «Спам». Якщо листа немає — надішліть повторно.</p>
        </div>

        {email && (
          <button
            onClick={resend}
            disabled={resending || resent}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/10 text-sm text-white/70 hover:bg-white/15 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
            {resendLabel}
          </button>
        )}

        <Link href="/sign-in" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          Повернутися до входу
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#302E2B]" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
