import { db } from "@/lib/db";
import { Users, BookOpen, AlertTriangle, ShieldX, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const AdminDashboard = async () => {
  const [totalUsers, blockedUsers, pendingCourse, pendingComment, totalCourses, totalWarnings] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { isBlocked: true } }),
      db.courseComplaint.count({ where: { status: "PENDING" } }),
      db.commentComplaint.count({ where: { status: "PENDING" } }),
      db.course.count(),
      db.userWarning.count(),
    ]);

  const pendingComplaints = pendingCourse + pendingComment;

  const stats = [
    { label: "Користувачів", value: totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Заблоковано", value: blockedUsers, icon: ShieldX, color: "text-red-400" },
    { label: "Курсів", value: totalCourses, icon: BookOpen, color: "text-[#FDAB04]" },
    { label: "Скарг (нові)", value: pendingComplaints, icon: AlertTriangle, color: "text-orange-400" },
    { label: "Попереджень", value: totalWarnings, icon: Bell, color: "text-yellow-400" },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Панель адміністратора</h1>
        <p className="text-white/40 text-sm mt-1">Управління платформою MilitaryTraining</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-[#3D3A36] border border-white/8 px-5 py-5 flex flex-col gap-3"
          >
            <div className={`p-2.5 rounded-xl bg-white/5 w-fit ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
