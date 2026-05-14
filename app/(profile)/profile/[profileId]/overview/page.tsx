import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ReadText from "@/components/custom/ReadTwxt";

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

  return (
    <div className="px-6 py-4 flex flex-col gap-5 text-sm">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-[#ebac66]">
          {profile.full_name || profile.user?.name}
        </h1>
      </div>

      {profile.isOrganization && (profile as any).edrpou && (
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">ЄДРПОУ:</p>
          <p>{(profile as any).edrpou}</p>
        </div>
      )}

      {(profile as any).contact_email && (
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Email:</p>
          <p>{(profile as any).contact_email}</p>
        </div>
      )}

      {profile.phone_number && (
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Телефон:</p>
          <p>{profile.phone_number}</p>
        </div>
      )}

      {!profile.isOrganization && profile.age && (
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Вік:</p>
          <p>{profile.age}</p>
        </div>
      )}

      {(profile.instagram || profile.telegram || profile.facebook) && (
        <div className="flex gap-4">
          {profile.instagram && (
            <div className="flex gap-2">
              <p className="text-[#ebac66] font-bold">Instagram:</p>
              <p>{profile.instagram}</p>
            </div>
          )}
          {profile.telegram && (
            <div className="flex gap-2">
              <p className="text-[#ebac66] font-bold">Telegram:</p>
              <p>{profile.telegram}</p>
            </div>
          )}
          {profile.facebook && (
            <div className="flex gap-2">
              <p className="text-[#ebac66] font-bold">Facebook:</p>
              <p>{profile.facebook}</p>
            </div>
          )}
        </div>
      )}

      {(profile as any).address && (
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Адреса:</p>
          <p>{(profile as any).address}</p>
        </div>
      )}

      {profile.description && (
        <div className="flex flex-col gap-2">
          <p className="text-[#ebac66] font-bold">Опис:</p>
          <ReadText value={profile.description} />
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;