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
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const formSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name is required and minimum 2 characters",
    }),
    phone_number: z.string().min(2, {
        message: "Phone number is required and minimum 10 characters",
    })
})

const CreateProfileForm = () => {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await axios.post("/api/profiles", values);
            router.push(`/users/profiles/${response.data.id}`);
            toast.success("ÐÐ¾Ð²Ð¸Ð¹ Ð¿Ñ€Ð¾Ñ„Ñ–Ð»ÑŒ ÑÑ‚Ð²Ð¾Ñ€ÐµÐ½Ð¾");
        } catch (err) {
            console.log("Failed to create new profile", err);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div className="p-4 md:p-10">
            <h1 className="text-xl font-bold">
                Ð—Ð°Ð¿Ð¾Ð²Ð½Ñ–Ñ‚ÑŒ, Ð±ÑƒÐ´ÑŒ Ð»Ð°ÑÐºÐ°, Ð½ÐµÐ¾Ð±Ñ…Ñ–Ð´Ð½Ñƒ Ñ–Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ñ–ÑŽ
            </h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-10">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> Ð†Ð¼&apos;Ñ</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ð’Ð²ÐµÐ´Ñ–Ñ‚ÑŒ ÑÐ²Ð¾Ñ” Ð¿Ð¾Ð²Ð½Ðµ Ñ–Ð¼'Ñ"
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
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>ÐÐ¾Ð¼ÐµÑ€ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½Ñƒ</FormLabel>
                                    <FormControl>
                                    <Input
                                        placeholder="Ð’Ð²ÐµÐ´Ñ–Ñ‚ÑŒ Ð½Ð¾Ð¼ÐµÑ€ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½Ñƒ"
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>


                    <Button type="submit">ÐŸÑ€Ð¾Ð´Ð¾Ð²Ð¶Ð¸Ñ‚Ð¸</Button>
                </form>
            </Form>
        </div>
    )
}

export default CreateProfileForm
