"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";
import { KeyRound, Mail, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ChangeCredentialsPage() {
  const { user, refreshAuth } = useAuth();

  // email section
  const [emailCurrentPw, setEmailCurrentPw] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // password section
  const [pwCurrentPw, setPwCurrentPw] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [showEmailPw, setShowEmailPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", currentPassword: emailCurrentPw, newEmail }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Помилка"); return; }
      toast.success("Email успішно змінено");
      await refreshAuth();
      setEmailCurrentPw("");
      setNewEmail("");
    } catch {
      toast.error("Щось пішло не так");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Нові паролі не збігаються");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Пароль має містити мінімум 6 символів");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", currentPassword: pwCurrentPw, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Помилка"); return; }
      toast.success("Пароль успішно змінено");
      setPwCurrentPw("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Щось пішло не так");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Зміна облікових даних</h1>

      {/* current account info */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50">
        Поточний email: <span className="text-white font-medium">{user?.email}</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* change email */}
        <div className="p-6 rounded-2xl bg-[#3D3A36] border border-white/10">
          <div className="flex items-center gap-2 mb-5">
            <Mail size={18} className="text-[#FDAB04]" />
            <h2 className="font-semibold text-white">Змінити email</h2>
          </div>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Новий email</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="нова@пошта.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Поточний пароль (підтвердження)</label>
              <div className="relative">
                <Input
                  type={showEmailPw ? "text" : "password"}
                  value={emailCurrentPw}
                  onChange={(e) => setEmailCurrentPw(e.target.value)}
                  placeholder="Введіть поточний пароль"
                  required
                />
                <button type="button" onClick={() => setShowEmailPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showEmailPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={emailLoading} className="w-full bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold">
              {emailLoading ? "Збереження…" : "Змінити email"}
            </Button>
          </form>
        </div>

        {/* change password */}
        <div className="p-6 rounded-2xl bg-[#3D3A36] border border-white/10">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound size={18} className="text-[#FDAB04]" />
            <h2 className="font-semibold text-white">Змінити пароль</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Поточний пароль</label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={pwCurrentPw}
                  onChange={(e) => setPwCurrentPw(e.target.value)}
                  placeholder="Введіть поточний пароль"
                  required
                />
                <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Новий пароль</label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Мінімум 6 символів"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Підтвердити новий пароль</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторіть новий пароль"
                required
              />
            </div>
            <Button type="submit" disabled={pwLoading} className="w-full bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold">
              {pwLoading ? "Збереження…" : "Змінити пароль"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
