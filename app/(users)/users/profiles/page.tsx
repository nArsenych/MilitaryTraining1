import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ReadText from "@/components/custom/ReadTwxt";

export const dynamic = "force-dynamic";

const CourseOverview = async ({ }: { params: { profileId: string } }) => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  // Try clientProfile first, then organizationProfile
  const clientProfile = await db.clientProfile.findUnique({
    where: { user_id: session.userId },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  if (clientProfile) {
    return (
      <div className="px-6 py-4 flex flex-col gap-5 text-sm">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-[#ebac66]">{clientProfile.full_name}</h1>
        </div>

        <div className="flex gap-2 items-center">
          <p className="text-sm text-gray-500">{clientProfile.user?.email}</p>
        </div>

        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Вік:</p>
          <p>{clientProfile.age}</p>
        </div>

        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Номер телефону:</p>
          <p>{clientProfile.phone_number}</p>
        </div>

        <div className="flex gap-4">
          <div className="flex gap-2">
            <p className="text-[#ebac66] font-bold">Instagram:</p>
            <p>{clientProfile.instagram}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-[#ebac66] font-bold">Telegram:</p>
            <p>{clientProfile.telegram}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-[#ebac66] font-bold">Facebook:</p>
            <p>{clientProfile.facebook}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[#ebac66] font-bold">Опис:</p>
          <ReadText value={clientProfile.description!} />
        </div>
      </div>
    );
  }

  const orgProfile = await db.organizationProfile.findUnique({
    where: { user_id: session.userId },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  if (!orgProfile) {
    return redirect("/");
  }

  return (
    <div className="px-6 py-4 flex flex-col gap-5 text-sm">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-[#ebac66]">{orgProfile.full_name}</h1>
      </div>

      <div className="flex gap-2 items-center">
        <p className="text-sm text-gray-500">{orgProfile.user?.email}</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Телефон:</p>
        <p>{orgProfile.phone_number}</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Email для зв&apos;язку:</p>
        <p>{orgProfile.contact_email}</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Адреса:</p>
        <p>{orgProfile.address}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Instagram:</p>
          <p>{orgProfile.instagram}</p>
        </div>
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Telegram:</p>
          <p>{orgProfile.telegram}</p>
        </div>
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Facebook:</p>
          <p>{orgProfile.facebook}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[#ebac66] font-bold">Опис:</p>
        <ReadText value={orgProfile.description!} />
      </div>
    </div>
  );
};

export default CourseOverview;
