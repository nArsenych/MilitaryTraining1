"use client"

import { Course } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { Badge } from "../ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Course>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Назва
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ціна
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const rawPrice = row.getValue("price") as string | number; 
            const price = parseFloat(rawPrice as string) || 0.0;
            const formatted = new Intl.NumberFormat("uk-UA", {
                style: "currency",
                currency: "UAH",
            }).format(price);
    
            return <div>{formatted}</div>;
        },
    },
    
    
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Дата створення
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAt = row.getValue("createdAt") as string; 
            const formattedDate = new Intl.DateTimeFormat("uk-UA", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(new Date(createdAt)); 
    
            return <div>{formattedDate}</div>;
        },
    },
    
    {
        accessorKey: "isPublished",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Статус
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const isPublished = row.getValue("isPublished") || false;

            return (
                <Badge
                    className={`${isPublished && "bg-[#e1cfac] text-black hover:bg-[#ffce6d]"
                        }`}
                >
                    {isPublished ? "Опубліковано" : "Чернетка"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <Link
                href={`/instructor/courses/${row.original.id}/basic`}
                className="flex gap-2 items-center hover:text-[#FDAB04]"
            >
                <Pencil className="h-4 w-4" /> Редагувати
            </Link>
        ),
    },
]
