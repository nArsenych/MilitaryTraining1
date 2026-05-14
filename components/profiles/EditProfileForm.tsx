"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
import { Loader2, Sparkles } from "lucide-react";
import EdrpouVerification from "@/components/custom/EdrpouVerification";

interface EditProfileFormProps {
  profile: Profile;
  isOrganization: boolean;
}

const EditProfileForm = ({ profile, isOrganization }: EditProfileFormProps) => {
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || "");
  const [contactEmail, setContactEmail] = useState((profile as any).contact_email || "");
  const [instagram, setInstagram] = useState(profile.instagram || "");
  const [telegram, setTelegram] = useState(profile.telegram || "");
  const [facebook, setFacebook] = useState(profile.facebook || "");
  const [description, setDescription] = useState(profile.description || "");
  const [edrpou, setEdrpou] = useState((profile as any).edrpou || "");
  const [address, setAddress] = useState((profile as any).address || "");
  const [age, setAge] = useState(profile.age?.toString() || "");
  const [isMilitary, setIsMilitary] = useState(profile.isMilitary || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [edrpouBlocked, setEdrpouBlocked] = useState(false);

  const handleGenerateDescription = async () => {
    if (!fullName.trim()) {
      toast.error("Спочатку введіть назву організації");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await axios.post("/api/generate-description", {
        name: fullName,
        edrpou,
        address,
        phone: phoneNumber,
        email: contactEmail,
        instagram,
        telegram,
        facebook,
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

    if (edrpouBlocked) {
      toast.error("Організація під санкціями — збереження заборонено");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Введіть ім'я / назву");
      return;
    }

    if (isOrganization && !description.trim()) {
      toast.error("Опис організації обов'язковий");
      return;
    }

    setIsLoading(true);
    try {
      await axios.patch(`/api/profiles/${profile.id}`, {
        full_name: fullName,
        phone_number: phoneNumber || null,
        contact_email: contactEmail || null,
        instagram: instagram || null,
        telegram: telegram || null,
        facebook: facebook || null,
        description: description || null,
        edrpou: edrpou || null,
        address: address || null,
        age: age ? parseInt(age) : null,
        isMilitary: isMilitary || null,
      });

      toast.success("Профіль оновлено!");
      router.refresh();
    } catch {
      toast.error("Помилка оновлення профілю");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-[#ebac66]">
          {isOrganization ? "Редагування профілю організації" : "Редагування профілю"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {isOrganization ? "Назва організації *" : "Повне ім'я *"}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isOrganization ? "Назва вашої організації" : "Ваше повне ім'я"}
              required
            />
          </div>

          {isOrganization && (
            <EdrpouVerification
              edrpou={edrpou}
              setEdrpou={setEdrpou}
              onVerified={(result) => {
                setEdrpouBlocked(result.hasSanctions);
              }}
            />
          )}

          <div className="border-t pt-3 mt-3">
            <h2 className="text-lg font-semibold mb-2">Способи зв&apos;язку</h2>
            <div className="flex flex-wrap" style={{ gap: "8px 16px" }}>
              <div style={{ width: "calc(33% - 11px)" }}>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+380XXXXXXXXX"
                />
              </div>
              <div style={{ width: "calc(33% - 11px)" }}>
                <label className="block text-sm font-medium mb-1">Email для зв&apos;язку</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@organization.com"
                />
              </div>
              <div style={{ width: "calc(33% - 11px)" }}>
                <label className="block text-sm font-medium mb-1">Instagram</label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@your_instagram"
                />
              </div>
              <div style={{ width: "calc(33% - 11px)" }}>
                <label className="block text-sm font-medium mb-1">Telegram</label>
                <Input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@your_telegram"
                />
              </div>
              <div style={{ width: "calc(33% - 11px)" }}>
                <label className="block text-sm font-medium mb-1">Facebook</label>
                <Input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/your_page"
                />
              </div>
            </div>
          </div>

          {isOrganization && (
            <div>
              <label className="block text-sm font-medium mb-1">Адреса (опціонально)</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="м. Київ, вул. ..."
              />
            </div>
          )}

          {!isOrganization && (
            <div className="border-t pt-3 mt-3 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Вік</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  min={14}
                  max={99}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMilitary"
                  checked={isMilitary}
                  onChange={(e) => setIsMilitary(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="isMilitary" className="text-sm font-medium">
                  Я військовослужбовець
                </label>
              </div>
            </div>
          )}

          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">
                Опис {isOrganization && "*"}
              </label>
              {isOrganization && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="flex items-center gap-1"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Генерація..." : "Згенерувати опис"}
                </Button>
              )}
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isOrganization
                  ? "Опишіть вашу організацію, її місію та послуги..."
                  : "Розкажіть про себе (опціонально)..."
              }
              rows={5}
              required={isOrganization}
            />
            {isOrganization && (
              <p className="text-xs text-gray-500 mt-1">
                Натисніть &quot;Згенерувати опис&quot; щоб ШІ створив опис, або напишіть самостійно
              </p>
            )}
          </div>

          <Button type="submit" className="w-64 mt-6" disabled={isLoading}>
            {isLoading ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;