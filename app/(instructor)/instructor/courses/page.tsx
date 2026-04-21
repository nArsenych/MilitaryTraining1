import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { DataTable } from "@/components/custom/DataTable";
import { columns } from "@/components/courses/Columns";

const CoursesPage = async () => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: { user_id: session.userId },
  });

  if (!profile) {
    return redirect("/select-type");
  }

  const courses = await db.course.findMany({
    where: {
      organizationId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="px-6 py-4">
      <Link href="/instructor/create-course">
        <Button>Створити курс</Button>
      </Link>
      
      <div className="mt-[5vh]">
        <DataTable columns={columns} data={courses} />
      </div>
    </div>
  );
};

export default CoursesPage;
