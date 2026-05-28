"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientProfile, OrganizationProfile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
import { Loader2, Sparkles, Lock, Trash2, Eye, EyeOff, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { PHONE_REGEX, validateProfileForm } from "@/lib/profile-validation";

interface EditProfileFormProps {
  profile: ClientProfile | OrganizationProfile;
  isOrganization: boolean;
  userEmail: string;
}

const inp = "bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors";
const lbl = "block text-xs font-semibold mb-1.5 text-white/60 uppercase tracking-wider";
async function withLoading(set: (v: boolean) => void, fn: () => Promise<void>) {
  set(true);
  try { await fn(); }
  catch { toast.error("Щось пішло не так"); }
  finally { set(false); }
}


interface MilitarySectionProps {
  isMilitary: boolean;
  initialIsMilitaryVerified: boolean;
  isMilEmail: boolean;
  onToggle: (checked: boolean) => void;
}

const MilitarySection = ({ isMilitary, initialIsMilitaryVerified, isMilEmail, onToggle }: MilitarySectionProps) => {
  const [milVerifyStep, setMilVerifyStep] = useState<"idle" | "code_sent" | "verified">(
    initialIsMilitaryVerified ? "verified" : "idle"
  );
  const [milCode, setMilCode] = useState("");
  const [milSending, setMilSending] = useState(false);
  const [milConfirming, setMilConfirming] = useState(false);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (!checked) { setMilVerifyStep("idle"); setMilCode(""); }
  };

  const handleSendMilCode = () => withLoading(setMilSending, async () => {
    const res = await fetch("/api/profile/verify-military", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Помилка надсилання коду"); return; }
    setMilVerifyStep("code_sent");
    setMilCode("");
    toast.success("Код надіслано на вашу пошту");
  });

  const handleConfirmMilCode = () => withLoading(setMilConfirming, async () => {
    if (milCode.length !== 6) { toast.error("Введіть 6-значний код"); return; }
    const res = await fetch("/api/profile/verify-military/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: milCode }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Неправильний код"); return; }
    setMilVerifyStep("verified");
    toast.success("Військовий статус верифіковано!");
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isMilitary"
          checked={isMilitary}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-4 w-4 accent-[#FDAB04]"
        />
        <label htmlFor="isMilitary" className="text-sm font-medium text-white/75 flex items-center gap-2">
          Я військовослужбовець
          {isMilitary && (milVerifyStep === "verified" ? (
            <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
              <ShieldCheck size={13} /> Верифіковано
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-yellow-400/80">
              <ShieldAlert size={13} /> Не верифіковано
            </span>
          ))}
        </label>
      </div>

      {isMilitary && (
        <div className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2 text-sm text-yellow-300/80">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>
              Для підтвердження статусу військовослужбовця необхідна пошта домену{" "}
              <span className="font-semibold text-yellow-300">@mil.gov.ua</span>.
              {!isMilEmail && " Ваш статус буде збережено як неверифікований."}
            </p>
          </div>

          {isMilEmail && milVerifyStep !== "verified" && (
            <div className="space-y-2">
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
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={milCode}
                    onChange={(e) => setMilCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Введіть 6-значний код"
                    className={`${inp} w-48 text-center tracking-widest text-lg font-bold`}
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
      )}
    </div>
  );
};

const DeleteSection = ({ profileId }: { profileId: string }) => {
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    withLoading(setIsDeleting, async () => {
      if (!deletePassword) { toast.error("Введіть пароль для підтвердження"); return; }
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || "Помилка видалення профілю"); return; }
      toast.success("Профіль видалено");
      window.location.href = "/sign-in";
    });
  };

  if (!showDeleteSection) {
    return (
      <button
        type="button"
        onClick={() => setShowDeleteSection(true)}
        className="flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 transition-colors"
      >
        <Trash2 size={15} />
        Видалити профіль
      </button>
    );
  }

  return (
    <div className="max-w-sm p-5 rounded-2xl bg-red-500/8 border border-red-500/20">
      <h3 className="font-semibold text-red-400 mb-1 flex items-center gap-2">
        <Trash2 size={16} /> Видалення профілю
      </h3>
      <p className="text-xs text-white/40 mb-4">Ця дія незворотна. Введіть пароль для підтвердження.</p>
      <form onSubmit={handleDelete} className="space-y-3">
        <div className="relative">
          <Input
            type={showDeletePw ? "text" : "password"}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Ваш пароль"
            required
            className={`${inp} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowDeletePw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {showDeletePw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white text-sm">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Видалити"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setShowDeleteSection(false); setDeletePassword(""); }}
            className="text-sm text-white/50 hover:text-white"
          >
            Скасувати
          </Button>
        </div>
      </form>
    </div>
  );
};

const EditProfileForm = ({ profile, isOrganization, userEmail }: EditProfileFormProps) => {
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || "");
  const [contactEmail, setContactEmail] = useState((profile as OrganizationProfile).contact_email || "");
  const [instagram, setInstagram] = useState(profile.instagram || "");
  const [telegram, setTelegram] = useState(profile.telegram || "");
  const [facebook, setFacebook] = useState(profile.facebook || "");
  const [description, setDescription] = useState(profile.description || "");
  const [address, setAddress] = useState((profile as OrganizationProfile).address || "");
  const [age, setAge] = useState((profile as ClientProfile).age?.toString() || "");
  const [isMilitary, setIsMilitary] = useState((profile as ClientProfile).isMilitary || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const isMilEmail = userEmail.endsWith("@mil.gov.ua");
  const edrpou = (profile as OrganizationProfile).edrpou as string | null | undefined;

  const handleGenerateDescription = () => withLoading(setIsGenerating, async () => {
    if (!fullName.trim()) { toast.error("Спочатку введіть назву організації"); return; }
    const res = await axios.post("/api/generate-description", {
      name: fullName,
      edrpou: edrpou || undefined,
      address,
      phone: phoneNumber,
      email: contactEmail,
      instagram,
      telegram,
      facebook,
    });
    setDescription(res.data.description);
    toast.success("Опис згенеровано! Ви можете його відредагувати.");
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateProfileForm(fullName, phoneNumber, isOrganization, description);
    if (error) { toast.error(error); return; }
    withLoading(setIsLoading, async () => {
      await axios.patch(`/api/profiles/${profile.id}`, {
        full_name: fullName,
        phone_number: phoneNumber || null,
        contact_email: contactEmail || null,
        instagram: instagram || null,
        telegram: telegram || null,
        facebook: facebook || null,
        description: description || null,
        address: address || null,
        age: age ? Number.parseInt(age) : null,
        isMilitary: isMilitary || null,
      });
      toast.success("Профіль оновлено!");
      router.refresh();
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#ebac66]">
            {isOrganization ? "Редагування профілю організації" : "Редагування профілю"}
          </h1>
        </div>

        {isOrganization && edrpou && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm">
            <Lock size={14} className="text-white/40 shrink-0" />
            <div>
              <span className="text-white/40 text-xs">ЄДРПОУ (незмінний)</span>
              <p className="text-white font-medium">{edrpou}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className={lbl}>
              {isOrganization ? "Назва організації *" : "Повне ім'я *"}
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isOrganization ? "Назва вашої організації" : "Ваше повне ім'я"}
              required
              className={inp}
            />
          </div>

          <div className="border-t border-white/8 pt-3 mt-3">
            <h2 className="text-lg font-semibold mb-2 text-[#ebac66]">Способи зв&apos;язку</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              {[
                { id: "phone", label: "Телефон", value: phoneNumber, setter: setPhoneNumber, placeholder: "+380XXXXXXXXX", type: "text" },
                { id: "contactEmail", label: "Email для зв'язку", value: contactEmail, setter: setContactEmail, placeholder: "контакт@вашдомен.com", type: "email" },
                { id: "instagram", label: "Instagram", value: instagram, setter: setInstagram, placeholder: "@your_instagram", type: "text" },
                { id: "telegram", label: "Telegram", value: telegram, setter: setTelegram, placeholder: "@your_telegram", type: "text" },
                { id: "facebook", label: "Facebook", value: facebook, setter: setFacebook, placeholder: "facebook.com/your_page", type: "text" },
              ].map(({ id, label, value, setter, placeholder, type }) => (
                <div key={id}>
                  <label htmlFor={id} className={lbl}>{label}</label>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className={inp}
                  />
                </div>
              ))}
            </div>
          </div>

          {isOrganization && (
            <div>
              <label htmlFor="address" className={lbl}>Адреса (опціонально)</label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="м. Київ, вул. ..." className={inp} />
            </div>
          )}

          {!isOrganization && (
            <div className="border-t border-white/8 pt-3 mt-3 space-y-4">
              <div>
                <label htmlFor="age" className={lbl}>Вік</label>
                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" min={14} max={99} className={inp} />
              </div>
              <MilitarySection
                isMilitary={isMilitary}
                initialIsMilitaryVerified={(profile as ClientProfile).isMilitaryVerified || false}
                isMilEmail={isMilEmail}
                onToggle={setIsMilitary}
              />
            </div>
          )}

          <div className="border-t border-white/8 pt-3 mt-3">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="description" className={lbl}>Опис {isOrganization && "*"}</label>
              {isOrganization && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="flex items-center gap-1 border-[#FDAB04]/30 text-[#FDAB04] hover:bg-[#FDAB04]/10 hover:border-[#FDAB04]/50"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "Генерація..." : "Згенерувати опис"}
                </Button>
              )}
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isOrganization ? "Опишіть вашу організацію, її місію та послуги..." : "Розкажіть про себе (опціонально)..."}
              rows={5}
              required={isOrganization}
              className={`${inp} resize-none`}
            />
          </div>

          <Button
            type="submit"
            className="w-64 mt-6 bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </form>

        <div className="mt-10 border-t border-red-500/20 pt-6">
          <DeleteSection profileId={profile.id} />
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
