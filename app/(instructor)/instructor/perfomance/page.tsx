import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { sendConfirmationEmail } from "@/app/actions/email";
import { revalidatePath } from "next/cache";
import { CheckCircle2, Phone, Send, Instagram, Facebook, Shield, Calendar, User } from "lucide-react";

export const dynamic = "force-dynamic";

async function confirmEnrollment(formData: FormData): Promise<void> {
  "use server";
  try {
    const purchaseId = formData.get("purchaseId") as string;
    await sendConfirmationEmail(formData);
    await db.purchase.update({ where: { id: purchaseId }, data: { confirmed: true } });
    revalidatePath("/instructor/perfomance");
  } catch (error) {
    console.error("Error confirming enrollment:", error);
    throw error;
  }
}

const CourseEnrollmentsPage: FC = async () => {
  const session = await getSession();
  if (!session) return redirect("/");

  const organizationProfile = await db.profile.findUnique({
    where: { user_id: session.userId },
  });

  if (!organizationProfile || !organizationProfile.isOrganization) return redirect("/");

  const coursesWithEnrollments = await db.course.findMany({
    where: { organizationId: organizationProfile.id },
    include: {
      purchases: {
        include: {
          student: {
            select: {
              id: true,
              user_id: true,
              full_name: true,
              phone_number: true,
              telegram: true,
              instagram: true,
              facebook: true,
              age: true,
              isMilitary: true,
              description: true,
            },
          },
        },
      },
      category: true,
      city: true,
      level: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold text-white mb-8">Мої курси та учасники</h2>

      {coursesWithEnrollments.length === 0 ? (
        <p className="text-white/40">У вас ще немає створених курсів.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {coursesWithEnrollments.map((course) => (
            <div key={course.id} className="rounded-2xl bg-[#3D3A36] border border-white/10 overflow-hidden">
              {/* course header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div>
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    {course.category.name}
                    {course.city && ` · ${course.city.name}`}
                    {course.level && ` · ${course.level.name}`}
                  </p>
                </div>
                <span className="text-xs text-white/40 bg-white/8 px-2.5 py-1 rounded-full">
                  {course.purchases.length} учасників
                </span>
              </div>

              {/* enrollments */}
              {course.purchases.length === 0 ? (
                <p className="px-5 py-4 text-sm text-white/30">На цей курс ще ніхто не записався.</p>
              ) : (
                <div className="divide-y divide-white/8">
                  {course.purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-start gap-4 px-5 py-3 hover:bg-white/4 transition-colors">
                      {/* name + badges */}
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-full bg-white/8 shrink-0 mt-0.5">
                          <User size={13} className="text-white/50" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-white truncate">
                              {purchase.student.full_name || "Без імені"}
                            </span>
                            {purchase.student.isMilitary && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                                <Shield size={9} /> Військовий
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-white/35">
                            {purchase.student.age && <span>{purchase.student.age} р.</span>}
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(purchase.createdAt).toLocaleDateString("uk-UA")}
                            </span>
                          </div>
                          {purchase.student.description && (
                            <p className="mt-1.5 text-xs text-white/45 leading-relaxed max-w-xs">
                              {purchase.student.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* contacts */}
                      <div className="flex items-center gap-3 shrink-0">
                        {purchase.student.phone_number && (
                          <span className="flex items-center gap-1 text-xs text-white/45">
                            <Phone size={11} /> {purchase.student.phone_number}
                          </span>
                        )}
                        {purchase.student.telegram && (
                          <span className="flex items-center gap-1 text-xs text-white/45">
                            <Send size={11} /> {purchase.student.telegram}
                          </span>
                        )}
                        {purchase.student.instagram && (
                          <span className="flex items-center gap-1 text-xs text-white/45">
                            <Instagram size={11} /> {purchase.student.instagram}
                          </span>
                        )}
                        {purchase.student.facebook && (
                          <span className="flex items-center gap-1 text-xs text-white/45">
                            <Facebook size={11} /> {purchase.student.facebook}
                          </span>
                        )}
                      </div>

                      {/* confirm */}
                      <div className="shrink-0">
                        {purchase.confirmed ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 size={12} /> Підтверджено
                          </span>
                        ) : (
                          <form action={confirmEnrollment}>
                            <input type="hidden" name="purchaseId" value={purchase.id} />
                            <input type="hidden" name="studentEmail" value={purchase.student.user_id} />
                            <Button
                              type="submit"
                              size="sm"
                              className="h-7 text-xs bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold px-3"
                            >
                              Підтвердити
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollmentsPage;
