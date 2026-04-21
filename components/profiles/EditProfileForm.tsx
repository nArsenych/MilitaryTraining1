"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Profile } from "@prisma/client";

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
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters long",
    }),
    description: z.string().optional(),
    phone_number: z.string().min(10, {}),
    isMilitary: z.boolean().optional(),
    age: z.coerce.number().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    telegram: z.string().optional(),
})

interface EditProfileFormProps {
    profile: Profile;
    isOrganization: boolean;
}

const EditProfileForm = ({ profile, isOrganization }: EditProfileFormProps) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: profile.full_name || "",
            description: profile.description || "",
            phone_number: profile.phone_number || "",
            isMilitary: profile.isMilitary || undefined,
            age: profile.age || undefined,
            instagram: profile.instagram || undefined,
            telegram: profile.telegram || undefined,
            facebook: profile.facebook || undefined
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/profiles/${profile.id}`, values);
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
                    <p>Заповніть інформацію про себе</p>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Ім&apos;я<span className="text-red-500">*</span>
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
                                        placeholder="Розкажіть про себе"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    Номер телефону <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {!isOrganization && (
                        <FormField
                            control={form.control}
                            name="isMilitary"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Ви Військовий?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            defaultValue={field.value?.toString()}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="true" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Так
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="false" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Ні
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    Ваш вік
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

                    <div className="flex flex-wrap gap-10">
                        <FormField
                            control={form.control}
                            name="instagram"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        Instagram
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
                            name="telegram"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        Telegram
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
                            name="facebook"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        Facebook
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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

export default EditProfileForm;