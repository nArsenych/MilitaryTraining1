"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from "axios"
import { BookOpen, Tag } from "lucide-react"

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
import { ComboBox } from "../custom/ComboBox"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Назва обов'язкова та повинна складатися не менше ніж з 2 символів",
  }),
  categoryId: z.string().min(1, {
    message: "Категорія обов'язкова",
  }),
})

interface CreateCourseFormProps {
  categories: { label: string; value: string }[]
}

const CreateCourseForm = ({ categories }: CreateCourseFormProps) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", categoryId: "" },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values)
      router.push(`/instructor/courses/${response.data.id}/basic`)
      toast.success("Новий курс створено")
    } catch (err) {
      console.log("Failed to create new course", err)
      toast.error("Щось пішло не так!")
    }
  }

  return (
    <div className="min-h-screen bg-[#302E2B] px-6 py-10 flex items-start justify-center">
      <div className="w-full max-w-xl flex flex-col gap-6">

        {/* header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FDAB04]/15">
            <BookOpen size={20} className="text-[#FDAB04]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Новий курс</h1>
            <p className="text-xs text-white/40 mt-0.5">Заповніть базові дані — решту можна налаштувати пізніше</p>
          </div>
        </div>

        {/* card */}
        <div className="rounded-2xl bg-[#3D3A36] border border-white/8 px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Назва курсу <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введіть назву курсу"
                        {...field}
                        className="bg-[#272523] border-white/10 text-white placeholder:text-white/30 focus:border-[#FDAB04]/50 transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Tag size={11} />
                        Категорія <span className="text-red-400">*</span>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <ComboBox options={categories} {...field} />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2 border-t border-white/8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:text-white hover:border-white/30"
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FDAB04] hover:bg-[#ebac66] text-black font-semibold flex-1 transition-colors"
                >
                  Створити курс
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default CreateCourseForm
