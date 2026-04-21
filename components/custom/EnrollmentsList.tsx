"use client";

import { Course, Purchase, Profile } from "@prisma/client";

type CourseWithEnrollments = Course & {
  purchases: (Purchase & {
    customer: Profile;
  })[];
};

interface EnrollmentsListProps {
  courses: CourseWithEnrollments[];
}

const EnrollmentsList = ({ courses }: EnrollmentsListProps) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Course Enrollments</h2>
      {courses.map((course) => (
        <div key={course.id} className="mb-6 p-4 border rounded-lg bg-white">
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <div className="mt-4">
            <h4 className="text-lg font-medium">
              Enrolled Students ({course.purchases.length}):
            </h4>
            {course.purchases.length > 0 ? (
              course.purchases.map((purchase) => (
                <div key={purchase.id} className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="font-medium">{purchase.customer.full_name}</p>
                  <p className="text-sm text-gray-600">
                    Enrolled on: {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Contact: {purchase.customer.phone_number || "No phone number provided"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 mt-2">No students enrolled yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnrollmentsList;