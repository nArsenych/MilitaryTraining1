"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/UseProfile";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Loader2, Sparkles, User, Building2, Phone, Mail, Instagram, Send, Facebook, MapPin,
  ShieldCheck, ShieldAlert, AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ─── helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#3D3A36] border border-white/8 px-6 py-5 flex flex-col gap-4">
      <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

const PHONE_REGEX = /^\+?[\d\s\-()()]{7,20}$/;

function validateProfileForm(
  fullName: string,
  phoneNumber: string,
  isOrganization: boolean,
  description: string,
): string | null {
  if (!fullName.trim()) return "Введіть ім'я / назву";
  if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) return "Введіть коректний номер телефону (наприклад, +380XXXXXXXXX)";
  if (isOrganization && !description.trim()) return "Опис організації обов'язковий";
  return null;
}

// ─── MilitaryCheckboxSection ──────────────────────────────────────────────────

function MilitaryCheckboxSection({
  isMilitary,
  isMilEmail,
  onChange,
}: {
  isMilitary: boolean;
  isMilEmail: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          id="isMilitary"
          checked={isMilitary}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[#FDAB04]"
        />
        <span className="text-sm font-medium text-white/75 flex items-center gap-2">
          Я військовослужбовець
          {isMilitary && (
            <span className="flex items-center gap-1 text-xs text-yellow-400/80">
              <ShieldAlert size={13} />
              {isMilEmail ? "Верифікацію буде запропоновано після створення" : "Не верифіковано"}
            </span>
          )}
        </span>
      </label>

      {isMilitary && (
        <div className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-start gap-2 text-sm text-yellow-300/80">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>
              Для підтвердження статусу військовослужбовця необхідна пошта домену{" "}
              <span className="font-semibold text-yellow-300">@mil.gov.ua</span>.
              {isMilEmail
                ? " Після створення профілю вам буде запропоновано верифікацію."
                : " Ваш статус буде збережено як неверифікований."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MilitaryVerifyView ───────────────────────────────────────────────────────

function MilitaryVerifyView({ onFinish }: { onFinish: () => void }) {
  const [milVerifyStep, setMilVerifyStep] = useState<"idle" | "code_sent" | "verified">("idle");
  const [milCode, setMilCode] = useState("");
  const [milSending, setMilSending] = useState(false);
  const [milConfirming, setMilConfirming] = useState(false);

  const handleSendMilCode = async () => {
    setMilSending(true);
    try {
      const res = await fetch("/api/profile/verify-military", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Помилка надсилання коду"); return; }
      setMilVerifyStep("code_sent");
      setMilCode("");
      toast.success("Код надіслано на вашу пошту");
    } catch {
      toast.error("Щось пішло не так");
    } finally {
      setMilSending(false);
    }
  };

  const handleConfirmMilCode = async () => {
    if (milCode.length !== 6) { toast.error("Введіть 6-значний код"); return; }
    setMilConfirming(true);
    try {
      const res = await fetch("/api/profile/verify-military/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: milCode }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Неправильний код"); return; }
      setMilVerifyStep("verified");
      toast.success("Військовий статус верифіковано!");
    } catch {
      toast.error("Щось пішло не так");
    } finally {
      setMilConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#302E2B] px-6 py-10">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FDAB04]/15">
            <ShieldCheck size={20} className="text-[#FDAB04]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Верифікація військового статусу</h1>
            <p className="text-xs text-white/40 mt-0.5">Підтвердіть статус через пошту @mil.gov.ua</p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 px-6 py-5 flex flex-col gap-4">
          {milVerifyStep !== "verified" && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
              <div className="flex items-start gap-2 text-sm text-yellow-300/80">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <p>
                  Для підтвердження статусу військовослужбовця необхідна пошта домену{" "}
                  <span className="font-semibold text-yellow-300">@mil.gov.ua</span>.
                </p>
              </div>

              {milVerifyStep === "idle" && (
                <button
                  type="button"
                  onClick={handleSendMilCode}
                  disabled={milSending}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#FDAB04] hover:text-[#ebac66] transition-colors disabled:opacity-50"
                >
                  {milSending ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  {milSending ? "Надсилання..." : "Верифікувати через пошту"}
                </button>
              )}

              {milVerifyStep === "code_sent" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={milCode}
                    onChange={(e) => setMilCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Введіть 6-значний код"
                    className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 w-48 text-center tracking-widest text-lg font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmMilCode}
                    disabled={milConfirming || milCode.length < 6}
                    className="px-3 py-2 rounded-lg bg-[#FDAB04] hover:bg-[#ebac66] text-black text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {milConfirming ? <Loader2 size={14} className="animate-spin" /> : "Підтвердити"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMilCode}
                    disabled={milSending}
                    className="text-xs text-white/40 hover:text-white/60 transition-colors disabled:opacity-40"
                  >
                    Надіслати знову
                  </button>
                </div>
              )}
            </div>
          )}

          {milVerifyStep === "verified" && (
            <div className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
              <ShieldCheck size={14} /> Статус верифіковано
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {milVerifyStep === "verified" ? (
            <Button onClick={onFinish} className="bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold h-11 flex-1">
              Продовжити
            </Button>
          ) : (
            <>
              <Button onClick={onFinish} variant="outline" className="flex-1 bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:text-white">
                Пропустити
              </Button>
              <Button className="flex-1 bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold" disabled>
                Продовжити
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CreateProfilePage ────────────────────────────────────────────────────────

export default function CreateProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOrganization } = useProfile();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [isMilitary, setIsMilitary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"form" | "mil-verify">("form");

  const isMilEmail = user?.email?.endsWith("@mil.gov.ua") ?? false;

  useEffect(() => {
    if (user?.name) setFullName(user.name);
  }, [user]);

  const handleGenerateDescription = async () => {
    if (!fullName.trim()) { toast.error("Спочатку введіть назву організації"); return; }
    setIsGenerating(true);
    try {
      const res = await axios.post("/api/generate-description", {
        name: fullName, address, phone: phoneNumber,
        email: contactEmail, instagram, telegram, facebook,
      });
      setDescription(res.data.description);
      toast.success("Опис згенеровано! Ви можете його відредагувати.");
    } catch {
      toast.error("Не вдалося згенерувати опис");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateProfileForm(fullName, phoneNumber, isOrganization, description);
    if (error) { toast.error(error); return; }

    setIsLoading(true);
    try {
      await axios.post("/api/profiles", {
        full_name: fullName,
        phone_number: phoneNumber || null,
        contact_email: contactEmail || null,
        instagram: instagram || null,
        telegram: telegram || null,
        facebook: facebook || null,
        description: description || null,
        address: address || null,
        age: age ? parseInt(age) : null,
        isMilitary: isMilitary || null,
      });
      toast.success("Профіль створено!");
      if (!isOrganization && isMilitary && isMilEmail) {
        setStep("mil-verify");
      } else {
        router.push(isOrganization ? "/instructor/courses" : "/");
      }
    } catch {
      toast.error("Помилка створення профілю");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "mil-verify") {
    return <MilitaryVerifyView onFinish={() => router.push("/")} />;
  }

  return (
    <div className="min-h-screen bg-[#302E2B] px-6 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FDAB04]/15">
            {isOrganization ? <Building2 size={20} className="text-[#FDAB04]" /> : <User size={20} className="text-[#FDAB04]" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isOrganization ? "Профіль організації" : "Створення профілю"}
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              {isOrganization ? "Заповніть дані про вашу організацію" : "Заповніть інформацію про себе"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Section title="Основне">
            <div>
              <FieldLabel>{isOrganization ? "Назва організації *" : "Повне ім'я *"}</FieldLabel>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isOrganization ? "Назва вашої організації" : "Ваше повне ім'я"}
                required
                className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors"
              />
            </div>

            {isOrganization && (
              <div>
                <FieldLabel>Адреса</FieldLabel>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="м. Київ, вул. ..."
                    className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors pl-8"
                  />
                </div>
              </div>
            )}

            {!isOrganization && (
              <>
                <div>
                  <FieldLabel>Вік</FieldLabel>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    min={14}
                    max={99}
                    className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors w-32"
                  />
                </div>
                <MilitaryCheckboxSection
                  isMilitary={isMilitary}
                  isMilEmail={isMilEmail}
                  onChange={setIsMilitary}
                />
              </>
            )}
          </Section>

          <Section title="Способи зв'язку">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Phone,     label: "Телефон",          value: phoneNumber,   setter: setPhoneNumber,   placeholder: "+380XXXXXXXXX",      type: "text" },
                { icon: Mail,      label: "Email для зв'язку", value: contactEmail,  setter: setContactEmail,  placeholder: "контакт@домен.com",   type: "email" },
                { icon: Instagram, label: "Instagram",         value: instagram,     setter: setInstagram,     placeholder: "@your_instagram",     type: "text" },
                { icon: Send,      label: "Telegram",          value: telegram,      setter: setTelegram,      placeholder: "@your_telegram",      type: "text" },
                { icon: Facebook,  label: "Facebook",          value: facebook,      setter: setFacebook,      placeholder: "facebook.com/page",   type: "text" },
              ].map(({ icon: Icon, label, value, setter, placeholder, type }) => (
                <div key={label}>
                  <FieldLabel>{label}</FieldLabel>
                  <div className="relative">
                    <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <Input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors pl-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={`Опис${isOrganization ? " *" : ""}`}>
            {isOrganization && (
              <div className="flex justify-end -mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-xs border-[#FDAB04]/30 text-[#FDAB04] hover:bg-[#FDAB04]/10 hover:border-[#FDAB04]/50"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {isGenerating ? "Генерація…" : "Згенерувати AI"}
                </Button>
              </div>
            )}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isOrganization ? "Опишіть вашу організацію, її місію та послуги…" : "Розкажіть про себе (опціонально)…"}
              rows={5}
              required={isOrganization}
              className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors resize-none"
            />
          </Section>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold h-11 mt-2 transition-colors"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isLoading ? "Збереження…" : "Створити профіль"}
          </Button>
        </form>
      </div>
    </div>
  );
}
