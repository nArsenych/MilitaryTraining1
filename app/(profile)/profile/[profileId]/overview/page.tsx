import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ReadText from "@/components/custom/ReadTwxt";
import { Phone, Mail, Instagram, Send, Facebook, MapPin, User, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

const ProfileOverview = async ({ params }: { params: Promise<{ profileId: string }> }) => {
  const { profileId } = await params;

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!profile) {
    return redirect("/");
  }

  const name = profile.full_name || profile.user?.name;
  const contactEmail = (profile as any).contact_email as string | null;
  const address = (profile as any).address as string | null;

  const hasContacts = profile.phone_number || contactEmail || profile.instagram || profile.telegram || profile.facebook || address;

  return (
    <div className="px-6 py-8 max-w-3xl">

      {/* header card */}
      <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${profile.isOrganization ? "bg-[#FDAB04]/15" : "bg-white/8"}`}>
            {profile.isOrganization
              ? <Building2 size={24} className="text-[#FDAB04]" />
              : <User size={24} className="text-white/60" />
            }
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
            {profile.isOrganization && (
              <p className="text-xs text-[#FDAB04] mt-0.5 font-medium uppercase tracking-wider">Організація</p>
            )}
            {!profile.isOrganization && profile.age && (
              <p className="text-sm text-white/50 mt-0.5">{profile.age} років</p>
            )}
          </div>
        </div>
      </div>

      {/* contacts */}
      {hasContacts && (
        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6 mb-5">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Контакти</p>
          <div className="flex flex-wrap gap-3">
            {profile.phone_number && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Phone size={13} className="text-[#FDAB04]" />
                {profile.phone_number}
              </div>
            )}
            {contactEmail && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Mail size={13} className="text-[#FDAB04]" />
                {contactEmail}
              </div>
            )}
            {profile.instagram && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Instagram size={13} className="text-[#FDAB04]" />
                {profile.instagram}
              </div>
            )}
            {profile.telegram && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Send size={13} className="text-[#FDAB04]" />
                {profile.telegram}
              </div>
            )}
            {profile.facebook && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Facebook size={13} className="text-[#FDAB04]" />
                {profile.facebook}
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <MapPin size={13} className="text-[#FDAB04]" />
                {address}
              </div>
            )}
          </div>
        </div>
      )}

      {/* description */}
      {profile.description && (
        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Опис</p>
          <div className="text-white/80 text-sm leading-relaxed">
            <ReadText value={profile.description} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;
