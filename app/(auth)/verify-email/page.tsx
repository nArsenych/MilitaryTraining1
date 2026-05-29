"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const DIGIT_SLOTS = ["s0", "s1", "s2", "s3", "s4", "s5"] as const;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const submit = async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      toast.error("Введіть 6-значний код");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Неправильний код");
        return;
      }

      await refreshAuth();
      toast.success("Email підтверджено!");
      router.push("/select-type");
    } catch {
      toast.error("Щось пішло не так");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
      toast.success("Новий код надіслано");
    } catch {
      toast.error("Помилка. Спробуйте ще раз.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#302E2B] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 rounded-full bg-[#FDAB04]/10 mb-4">
              <Mail size={28} className="text-[#FDAB04]" />
            </div>
            <h1 className="text-2xl font-bold text-center">Підтвердіть пошту</h1>
            <p className="text-sm text-gray-500 text-center mt-2">
              Ми надіслали 6-значний код на{" "}
              {email && <span className="font-medium text-gray-700">{email}</span>}
            </p>
          </div>

          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={DIGIT_SLOTS[i]}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-13 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors
                  border-gray-200 focus:border-[#FDAB04] text-gray-900 bg-gray-50"
                style={{ height: "52px" }}
              />
            ))}
          </div>

          <button
            onClick={submit}
            disabled={loading || digits.join("").length < 6}
            className="w-full py-2.5 rounded-xl bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold text-sm transition-colors disabled:opacity-50 mb-4"
          >
            {loading ? "Перевірка..." : "Підтвердити"}
          </button>

          <div className="text-center">
            <button
              onClick={resend}
              disabled={resending}
              className="flex items-center gap-1.5 mx-auto text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
              {resending ? "Надсилання..." : "Надіслати код повторно"}
            </button>
          </div>

          <p className="text-center text-sm mt-4 text-gray-500">
            <Link href="/sign-in" className="text-[#EBAC66] hover:underline font-medium">
              Повернутися до входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#302E2B]" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
