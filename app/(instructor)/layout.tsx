import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const Instructorlayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex h-full">
        <Sidebar />
        <div className="flex-1 bg-[#4E4C4B] min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default Instructorlayout;
