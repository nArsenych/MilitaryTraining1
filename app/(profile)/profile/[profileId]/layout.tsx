import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const ProfileDetailsLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ profileId: string }>;
}) => {
  const { profileId } = await params;

  const profile = await db.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 bg-[#4E4C4B] min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default ProfileDetailsLayout;