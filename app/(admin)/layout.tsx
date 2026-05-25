import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session || !(await isAdmin(session.userId))) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 bg-[#302E2B] pb-16 md:pb-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
