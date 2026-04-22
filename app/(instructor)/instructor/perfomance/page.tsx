import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { sendConfirmationEmail } from "@/app/actions/email";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function confirmEnrollment(formData: FormData): Promise<void> {
  'use server';

  try {
    const purchaseId = formData.get('purchaseId') as string;

    await sendConfirmationEmail(formData);

    await db.purchase.update({
      where: { id: purchaseId },
      data: { confirmed: true }
    });

    revalidatePath('/instructor/perfomance');
  } catch (error) {
    console.error('Error confirming enrollment:', error);
    throw error; 
  }
}

const CourseEnrollmentsPage: FC = async () => {
  const session = await getSession();

  if (!session) {
    return redirect("/");
  }

  const organizationProfile = await db.profile.findUnique({
    where: {
      user_id: session.userId,
    },
  });

  if (!organizationProfile || !organizationProfile.isOrganization) {
    return redirect("/");
  }

  const coursesWithEnrollments = await db.course.findMany({
    where: {
      organizationId: organizationProfile.id,
    },
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
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Мої курси та учасники</h2>
      {coursesWithEnrollments.length === 0 ? (
        <p className="text-gray-500">У вас ще немає створених курсів.</p>
      ) : (
        <div className="grid gap-6">
          {coursesWithEnrollments.map((course) => (
            <div key={course.id} className="border rounded-lg p-6 bg-[#F1CDA6] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <div className="text-sm text-gray-500 space-y-1 bg-[#F1CDA6]">
                  <p>Категорія: {course.category.name}</p>
                  {course.city && <p>Місто: {course.city.name}</p>}
                  {course.level && <p>Рівень: {course.level.name}</p>}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-medium mb-3">
                  Записані учасники ({course.purchases.length}):
                </h4>
                {course.purchases.length > 0 ? (
                  <div className="space-y-3">
                    {course.purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-1/3">
                              {purchase.student.full_name || 'Без імені'}
                              {purchase.student.isMilitary && (
                                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Військовий
                                </span>
                              )}
                            {purchase.student.age && (
                              <p className="text-sm text-gray-600">
                                Вік: {purchase.student.age} років
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              Записався: {new Date(purchase.createdAt).toLocaleDateString('uk-UA')}
                            </p>
                            {purchase.confirmed ? (
                              <Button
                                className="mt-2 bg-green-100 text-green-800 hover:bg-green-100"
                                disabled
                              >
                                Запис підтверджено ✓
                              </Button>
                            ) : (
                              <form action={confirmEnrollment}>
                                <input type="hidden" name="purchaseId" value={purchase.id} />
                                <Button
                                  type="submit"
                                  className="mt-2"
                                  variant="outline"
                                >
                                  Підтвердити запис
                                </Button>
                              </form>
                            )}
                          </div>

                          <div className="w-1/3 px-4 text-sm text-gray-600">
                            {purchase.student.description ? (
                              <div className="prose prose-sm max-w-none" 
                                   dangerouslySetInnerHTML={{ __html: purchase.student.description }}>
                              </div>
                            ) : (
                              <p className="text-gray-400 italic">Опис відсутній</p>
                            )}
                          </div>

                          <div className="w-1/3 text-right text-sm text-gray-600 space-y-1">
                            {purchase.student.phone_number && (
                              <p>Телефон: {purchase.student.phone_number}</p>
                            )}
                            {purchase.student.telegram && (
                              <p>Telegram: {purchase.student.telegram}</p>
                            )}
                            {purchase.student.instagram && (
                              <p>Instagram: {purchase.student.instagram}</p>
                            )}
                            {purchase.student.facebook && (
                              <p>Facebook: {purchase.student.facebook}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">На цей курс ще ніхто не записався.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollmentsPage;
