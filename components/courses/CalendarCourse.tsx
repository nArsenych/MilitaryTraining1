"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Course } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface CalendarCoursesProps {
    courses: (Course & {
        category: { name: string };
        organizationName: string;
    })[];
}

const CalendarCourses = ({ courses }: CalendarCoursesProps) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
    const [selectedCourses, setSelectedCourses] = React.useState<typeof courses>([]);

    const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
        return date >= startDate && date <= endDate;
    };

    const handleSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const coursesOnDate = courses.filter((course) => {
                if (!course.startDate || !course.endDate) return false;

                const courseStartDate = new Date(course.startDate);
                const courseEndDate = new Date(course.endDate);
                return isDateInRange(date, courseStartDate, courseEndDate);
            });
            setSelectedCourses(coursesOnDate);
        } else {
            setSelectedCourses([]);
        }
    };

    const getDayHasCourses = (day: Date) => {
        return courses.some((course) => {
            if (!course.startDate || !course.endDate) return false;

            const courseStartDate = new Date(course.startDate);
            const courseEndDate = new Date(course.endDate);
            return isDateInRange(day, courseStartDate, courseEndDate);
        });
    };

    return (
        <div className="flex gap-4 h-[50vh]">
            <div className="border rounded-lg p-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    modifiers={{
                        hasCourses: (date) => getDayHasCourses(date),
                    }}
                    modifiersStyles={{
                        hasCourses: {
                            backgroundColor: "#F1CDA6",
                            fontWeight: "bold",
                        },
                    }}
                    className="rounded-md"
                />
            </div>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        {selectedDate
                            ? `Курси на ${format(selectedDate, "dd.MM.yyyy")}`
                            : "Виберіть дату"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        {selectedCourses.length > 0 ? (
                            <div className="space-y-4">
                                {selectedCourses.map((course) => (

                                    <Link
                                        key={course.id}
                                        href={`/courses/${course.id}/overview`}
                                        className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >

                                        <Card key={course.id} className="p-4">
                                            <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>Категорія: {course.category.name}</p>
                                                <p>Організатор: {course.organizationName}</p>
                                                {course.startDate && course.endDate && (
                                                    <p>
                                                        Період: {format(new Date(course.startDate), "dd.MM.yyyy")} -{" "}
                                                        {format(new Date(course.endDate), "dd.MM.yyyy")}
                                                    </p>
                                                )}
                                                {course.startAge && (
                                                    <p>Вік: від {course.startAge} років</p>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center">
                                {selectedDate
                                    ? "На цю дату немає курсів"
                                    : "Виберіть дату для перегляду курсів"}
                            </p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default CalendarCourses;