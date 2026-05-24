"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Course } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";

interface CalendarCoursesProps {
    courses: (Course & {
        category: { name: string };
        organizationName: string;
    })[];
}

const CalendarCourses = ({ courses }: CalendarCoursesProps) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
    const [selectedCourses, setSelectedCourses] = React.useState<typeof courses>([]);

    const isDateInRange = (date: Date, startDate: Date, endDate: Date) =>
        date >= startDate && date <= endDate;

    const handleSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            setSelectedCourses(
                courses.filter((course) => {
                    if (!course.startDate || !course.endDate) return false;
                    return isDateInRange(date, new Date(course.startDate), new Date(course.endDate));
                })
            );
        } else {
            setSelectedCourses([]);
        }
    };

    const getDayHasCourses = (day: Date) =>
        courses.some((course) => {
            if (!course.startDate || !course.endDate) return false;
            return isDateInRange(day, new Date(course.startDate), new Date(course.endDate));
        });

    return (
        <div className="flex flex-col md:flex-row gap-5 min-h-[380px]">
            {/* calendar panel */}
            <div className="bg-[#3D3A36] border border-white/10 rounded-2xl p-4 shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <CalendarDays size={16} className="text-[#FDAB04]" />
                    <span className="text-sm font-semibold text-white/70">Розклад курсів</span>
                </div>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    modifiers={{ hasCourses: (date) => getDayHasCourses(date) }}
                    modifiersStyles={{
                        hasCourses: {
                            backgroundColor: "rgba(253,171,4,0.25)",
                            color: "#FDAB04",
                            fontWeight: "700",
                            borderRadius: "6px",
                        },
                    }}
                    className="rounded-xl text-white [&_button]:text-white [&_button:hover]:bg-white/10 [&_.rdp-day_selected]:bg-[#FDAB04] [&_.rdp-day_selected]:text-black"
                />
            </div>

            {/* courses list panel */}
            <div className="flex-1 bg-[#3D3A36] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                    <p className="text-white font-semibold">
                        {selectedDate
                            ? `Курси на ${format(selectedDate, "dd.MM.yyyy")}`
                            : "Виберіть дату"}
                    </p>
                    {selectedCourses.length > 0 && (
                        <p className="text-xs text-white/40 mt-0.5">{selectedCourses.length} курс(ів)</p>
                    )}
                </div>

                <ScrollArea className="flex-1 px-4 py-3">
                    {selectedCourses.length > 0 ? (
                        <div className="space-y-3">
                            {selectedCourses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/courses/${course.id}/overview`}
                                    className="group flex items-start justify-between gap-3 p-4 rounded-xl bg-white/5 hover:bg-[#FDAB04]/10 border border-white/5 hover:border-[#FDAB04]/30 transition-all"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm text-white group-hover:text-[#FDAB04] transition-colors truncate">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-white/40 mt-1 truncate">
                                            {course.organizationName} · {course.category.name}
                                        </p>
                                        {course.startDate && course.endDate && (
                                            <p className="text-xs text-white/30 mt-0.5">
                                                {format(new Date(course.startDate), "dd.MM")} – {format(new Date(course.endDate), "dd.MM.yyyy")}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="text-white/20 group-hover:text-[#FDAB04] shrink-0 mt-0.5 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <CalendarDays size={32} className="text-white/10 mb-3" />
                            <p className="text-sm text-white/30">
                                {selectedDate ? "На цю дату немає курсів" : "Виберіть дату для перегляду курсів"}
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default CalendarCourses;
