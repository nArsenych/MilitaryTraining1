"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from "axios";

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
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Назва обов'язкова та повинна складатися не менше ніж з 2 символів",
    }),
    categoryId: z.string().min(1, {
        message: "Категорія обов'язкова",
    }),
})

interface CreateCourseFormProps {
    categories: {
        label: string; 
        value: string; 
    }[];
}

const CreateCourseForm = ({ categories }: CreateCourseFormProps) => {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            categoryId: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await axios.post("/api/courses", values);
            router.push(`/instructor/courses/${response.data.id}/basic`);
            toast.success("Новий курс створено");
        } catch (err) {
            console.log("Failed to create new course", err);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-xl font-bold">
                Заповніть дані про курс
            </h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-10">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Назва</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Write the name of your course"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="relative overflow-visible">
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Категорія</FormLabel>
                                    <FormControl>
                                        <ComboBox options={categories} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    )
}

export default CreateCourseForm