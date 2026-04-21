"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Course } from "@prisma/client";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import RichEditor from "@/components/custom/RichEditor";
import { ComboBox } from "@/components/custom/ComboBox";
import FileUpload from "@/components/custom/FileUpload";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";
import Delete from "@/components/custom/Delete";
import PublishButton from "@/components/custom/PublishButton";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Назва повинна містити мінімум 2 символи",
  }),
  description: z.string().optional(),
  categoryId: z.string().min(1, {
    message: "Категорія обов'язкова",
  }),
  levelId: z.string().min(1, {
    message: "Рівень обов'язковий",
  }),
  imageUrl: z.string().optional(),
  price: z.coerce.number().optional(),
  startAge: z.coerce.number(),
  endAge: z.coerce.number().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  cityId: z.string().min(1, {
    message: "Місто обов'язкове",
  }),
})

interface EditCourseFormProps {
  course: Course;
  categories: {
    label: string;
    value: string;
  }[];
  levels: {
    label: string;
    value: string
  }[];
  cities: {
    label: string;
    value: string
  }[];
  isCompleted: boolean;
}

const EditCourseForm = ({ course, categories, levels, cities, isCompleted }: EditCourseFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      description: course.description || "",
      categoryId: course.categoryId,
      levelId: course.levelId || "",
      imageUrl: course.imageUrl || "",
      price: course.price || undefined,
      startAge: course.startAge || undefined,
      endAge: course.endAge || undefined,
      startDate: course.startDate ? new Date(course.startDate) : undefined,
      endDate: course.endDate ? new Date(course.endDate) : undefined,
      cityId: course.cityId || ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${course.id}`, values);
      toast.success("Зміни збережено");
      router.refresh();
    } catch (err) {
      console.log("Failed to update the course", err);
      toast.error("Something went wrong!");
    }
  };


  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-7">
        <div className="flex gap-5">
          <p>Заповніть інформацію про курс</p>
        </div>

        <div className="flex gap-5 items-start">
          <PublishButton
            disabled={!isCompleted}
            courseId={course.id}
            isPublished={course.isPublished}
            page="Course"
          />
          <Delete item="course" courseId={course.id} />
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Назва<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Опис 
                </FormLabel>
                <FormControl>
                  <RichEditor
                    placeholder="Про що цей курс?"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-10">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Категорія <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboBox options={categories} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="levelId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Для кого розрахований курс <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboBox options={levels} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
          <div className="flex flex-wrap gap-10">
            <FormField
              control={form.control}
              name="startAge"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Мінімальний вік <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endAge"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Максимальний вік
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
          <div className="flex flex-wrap gap-10">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Початок курсу <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Кінець курсу <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Місто <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ComboBox options={cities} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Заставка
                </FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value || ""}
                    onChange={(url) => field.onChange(url)}
                    endpoint="courseBanner"
                    page="Edit Course"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ціна
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5">
            <Link href="/instructor/courses">
              <Button variant="outline" type="button">
                Скасувати
              </Button>
            </Link>
            <Button type="submit">Зберегти</Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default EditCourseForm