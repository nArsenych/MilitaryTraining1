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

      toast.success("Successfully enrolled!");
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
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