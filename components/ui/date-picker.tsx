"use client"

import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface DatePickerProps {
  readonly startYear?: number;
  readonly endYear?: number;
  readonly value?: Date;
  readonly onChange?: (date: Date | undefined) => void;
  readonly minDate?: Date;
}

function normalizeDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

export function DatePicker({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  value,
  onChange,
  minDate,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date>(value ? normalizeDate(value) : new Date());

  const months = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
  ];

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date, months.indexOf(month));
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, Number.parseInt(year));
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const normalized = normalizeDate(selectedDate);
      setDate(normalized);
      onChange?.(normalized);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[250px] justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd.MM.yyyy") : <span>Оберіть дату</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md">
        <div className="flex justify-between p-2 bg-white">
          <Select onValueChange={handleMonthChange} value={months[getMonth(date)]}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Місяць" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleYearChange} value={getYear(date).toString()}>
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Рік" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          month={date}
          onMonthChange={setDate}
          disabled={minDate ? { before: minDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
