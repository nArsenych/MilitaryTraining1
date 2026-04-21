import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ReadText from "@/components/custom/ReadTwxt";

const CourseOverview = async ({ }: { params: { profileId: string } }) => {
  const session = await getSession();
    
  if (!session) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: {
      user_id: session.userId
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="px-6 py-4 flex flex-col gap-5 text-sm">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-[#ebac66]">{profile.full_name}</h1>
      </div>

      <div className="flex gap-2 items-center">
        <p className="text-sm text-gray-500">{profile.user?.email}</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Вік:</p>
        <p>{profile.age}</p>
      </div>

      <div className="flex gap-2">
        <p className="text-[#ebac66] font-bold">Номер телефону:</p>
        <p>{profile.phone_number}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Instagram:</p>
          <p>{profile.instagram}</p>
        </div>
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Telegram:</p>
          <p>{profile.telegram}</p>
        </div>
        <div className="flex gap-2">
          <p className="text-[#ebac66] font-bold">Facebook:</p>
          <p>{profile.facebook}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[#ebac66] font-bold">Опис:</p>
        <ReadText value={profile.description!} />
      </div>
    </div>
  );
};

export default CourseOverview;
