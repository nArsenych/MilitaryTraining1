"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  organizationId: string;
  isSignedIn: boolean;
  isAdmin?: boolean;
}

const OrganizationComplaintButton = ({ organizationId, isSignedIn, isAdmin }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isSignedIn || isAdmin) return null;

  const submit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка");
      toast.success("Скаргу надіслано. Адміністратор розгляне її найближчим часом.");
      setSent(true);
      setOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-white/25">
        <Flag size={12} />
        Скаргу надіслано
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-white/25 hover:text-red-400 transition-colors"
      >
        <Flag size={12} />
        Поскаржитися на організацію
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#3D3A36] rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-1">Скарга на організацію</h2>
            <p className="text-white/40 text-sm mb-4">
              Опишіть причину скарги. Адміністратор розгляне її протягом 24 годин.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Опишіть порушення..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-[#302E2B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FDAB04]/50 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/8 text-white/70 text-sm"
              >
                Скасувати
              </button>
              <button
                onClick={submit}
                disabled={loading || !reason.trim()}
                className="px-4 py-2 rounded-xl bg-[#FDAB04] text-black text-sm font-semibold disabled:opacity-50"
              >
                Надіслати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizationComplaintButton;
