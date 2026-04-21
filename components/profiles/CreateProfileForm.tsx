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
            toast.success("Новий профіль створено");
        } catch (err) {
            console.log("Failed to create new profile", err);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-xl font-bold">
                Заповніть, будь ласка, необхідну інформацію
            </h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-10">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> Ім&apos;я</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Введіть своє повне ім'я"
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
                                    <FormLabel>Номер телефону</FormLabel>
                                    <FormControl>
                                    <Input
                                        placeholder="Введіть номер телефону"
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>


                    <Button type="submit">Продовжити</Button>
                </form>
            </Form>
        </div>
    )
}

export default CreateProfileForm