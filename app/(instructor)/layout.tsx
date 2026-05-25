import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const Instructorlayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 bg-[#302E2B] pb-16 md:pb-0">{children}</div>
    </div>
  );
};

export default Instructorlayout;
