"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface PublishButtonProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
  page: string;
}

const PublishButton = ({ disabled, courseId, isPublished, page }: PublishButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    const url = `/api/courses/${courseId}`;
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.post(`${url}/unpublish`);
        toast.success(`${page} знято з публікації`);
      } else {
        await axios.post(`${url}/publish`);
        toast.success(`${page} опубліковано`);
      }
      router.refresh();
    } catch (error) {
      toast.error("Щось пішло не так!");
      console.log(`Failed to ${isPublished ? "unpublish" : "publish"} ${page}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const label = isPublished ? "Зняти з публікації" : "Опублікувати";

  return (
    <Button variant="outline" disabled={disabled || isLoading} onClick={onClick}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </Button>
  );
};

export default PublishButton;
