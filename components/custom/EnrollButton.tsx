"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

interface EnrollButtonProps {
  courseId: string;
  studentId: string;
  className?: string;
}

export const EnrollButton = ({
  courseId,
  className
}: EnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(`/api/courses/${courseId}/enroll`);
      console.log("Enrollment response:", response.data); 

      toast.success("Ви успішно записались на курс!");
      window.location.reload();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Щось пішло не так";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Завантаження..." : "Записатися на курс"}
    </button>
  );
}