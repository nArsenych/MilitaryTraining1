"use client"

import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

interface CategoriesProps {
  categories: Category[];
  selectedCategory: string | null;
}

const Categories = ({ categories, selectedCategory }: CategoriesProps) => {
  const router = useRouter();

  const onClick = (categoryId: string | null) => {
    router.push(categoryId ? `/categories/${categoryId}` : "/categories");
  };

  const onHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-wrap px-4 gap-7 justify-center my-10">
      <Button
        variant="outline"
        onClick={onHomeClick}
        className="gap-2"
      >
        <Home size={20} />
      </Button>
      
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onClick(null)}
      >
        Всі категорії
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onClick(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default Categories;