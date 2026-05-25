import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, isAdmin as checkIsAdmin } from "@/lib/auth";
import ReadText from "@/components/custom/ReadTwxt";
import OrganizationComplaintButton from "@/components/profiles/OrganizationComplaintButton";
import { Phone, Mail, Instagram, Send, Facebook, MapPin, User, Building2, ShieldCheck, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

const ProfileOverview = async ({ params }: { params: Promise<{ profileId: string }> }) => {
  const { profileId } = await params;
  const session = await getSession();

  // Try clientProfile first, then organizationProfile
  const clientProfile = await db.clientProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (clientProfile) {
    const name = clientProfile.full_name || clientProfile.user?.name;
    const hasContacts =
      clientProfile.phone_number ||
      clientProfile.instagram ||
      clientProfile.telegram ||
      clientProfile.facebook;

    return (
      <div className="px-6 py-8 max-w-3xl">
        {/* header card */}
        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/8">
              <User size={24} className="text-white/60" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              {clientProfile.age && (
                <p className="text-sm text-white/50 mt-0.5">{clientProfile.age} років</p>
              )}
              {clientProfile.isMilitary && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {clientProfile.isMilitaryVerified ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                      <ShieldCheck size={13} /> Верифікований військовослужбовець
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-yellow-400/80">
                      <ShieldAlert size={13} /> Військовослужбовець (не верифіковано)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* contacts */}
        {hasContacts && (
          <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6 mb-5">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Контакти</p>
            <div className="flex flex-wrap gap-3">
              {clientProfile.phone_number && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                  <Phone size={13} className="text-[#FDAB04]" />
                  {clientProfile.phone_number}
                </div>
              )}
              {clientProfile.instagram && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                  <Instagram size={13} className="text-[#FDAB04]" />
                  {clientProfile.instagram}
                </div>
              )}
              {clientProfile.telegram && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                  <Send size={13} className="text-[#FDAB04]" />
                  {clientProfile.telegram}
                </div>
              )}
              {clientProfile.facebook && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                  <Facebook size={13} className="text-[#FDAB04]" />
                  {clientProfile.facebook}
                </div>
              )}
            </div>
          </div>
        )}

        {/* description */}
        {clientProfile.description && (
          <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Опис</p>
            <div className="text-white/80 text-sm leading-relaxed">
              <ReadText value={clientProfile.description} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Try organizationProfile
  const orgProfile = await db.organizationProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!orgProfile) {
    return redirect("/");
  }

  const name = orgProfile.full_name || orgProfile.user?.name;
  const hasContacts =
    orgProfile.phone_number ||
    orgProfile.contact_email ||
    orgProfile.instagram ||
    orgProfile.telegram ||
    orgProfile.facebook ||
    orgProfile.address;

  return (
    <div className="px-6 py-8 max-w-3xl">
      {/* header card */}
      <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FDAB04]/15">
            <Building2 size={24} className="text-[#FDAB04]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
            <p className="text-xs text-[#FDAB04] mt-0.5 font-medium uppercase tracking-wider">Організація</p>
          </div>
        </div>
      </div>

      {/* contacts */}
      {hasContacts && (
        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6 mb-5">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Контакти</p>
          <div className="flex flex-wrap gap-3">
            {orgProfile.phone_number && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Phone size={13} className="text-[#FDAB04]" />
                {orgProfile.phone_number}
              </div>
            )}
            {orgProfile.contact_email && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Mail size={13} className="text-[#FDAB04]" />
                {orgProfile.contact_email}
              </div>
            )}
            {orgProfile.instagram && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Instagram size={13} className="text-[#FDAB04]" />
                {orgProfile.instagram}
              </div>
            )}
            {orgProfile.telegram && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Send size={13} className="text-[#FDAB04]" />
                {orgProfile.telegram}
              </div>
            )}
            {orgProfile.facebook && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <Facebook size={13} className="text-[#FDAB04]" />
                {orgProfile.facebook}
              </div>
            )}
            {orgProfile.address && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/80">
                <MapPin size={13} className="text-[#FDAB04]" />
                {orgProfile.address}
              </div>
            )}
          </div>
        </div>
      )}

      {/* description */}
      {orgProfile.description && (
        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 p-6">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Опис</p>
          <div className="text-white/80 text-sm leading-relaxed">
            <ReadText value={orgProfile.description} />
          </div>
        </div>
      )}

      {/* complaint — not for own profile, not for admins */}
      {orgProfile.user_id !== session?.userId && (
        <div className="flex justify-end mt-2">
          <OrganizationComplaintButton
            organizationId={orgProfile.id}
            isSignedIn={!!session}
            isAdmin={session ? await checkIsAdmin(session.userId) : false}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;
