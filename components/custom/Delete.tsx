import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

interface DeleteProps {
  item: string;
  courseId: string;
  sectionId?: string;
}

const Delete = ({ item, courseId, sectionId }: DeleteProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const url =
        item === "course"
          ? `/api/courses/${courseId}`
          : `/api/courses/${courseId}/sections/${sectionId}`;
      await axios.delete(url);

      setIsDeleting(false);
      const pushedUrl =
        item === "course"
          ? "/instructor/courses"
          : `/instructor/courses/${courseId}/sections`;
      router.push(pushedUrl);
      router.refresh();
      toast.success(`${item} deleted`);
    } catch (err) {
      toast.error(`Something went wrong!`);
      console.log(`Failed to delete the ${item}`, err);
    }
  };

  return (
    <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button 
      variant="outline" 
      size="icon"
      className="hover:bg-red-100 hover:text-red-600 transition-colors"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash className="h-4 w-4" />
      )}
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="bg-white max-w-[400px] max-h-[200px] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] absolute">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-lg font-bold text-red-500">
        Ви впевнені, що хочете видалити курс?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-gray-600">
        Цю дію не можна скасувати. Це назавжди видалить ваш курс
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="gap-2">
      <AlertDialogCancel 
        className="bg-gray-100 hover:bg-gray-200 text-gray-900"
      >
        Скасувати
      </AlertDialogCancel>
      <AlertDialogAction 
        onClick={onDelete}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Trash className="h-4 w-4 mr-2" />
        )}
        Видалити
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
  );
};

export default Delete;