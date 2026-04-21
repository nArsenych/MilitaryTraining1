"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";

const SelectAccountType = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onSelect = async (type: "ORGANIZATION" | "CLIENT") => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error("Unauthorized");
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOrganization: type === "ORGANIZATION",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      router.push("/users/create-profile");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold mb-4">Оберіть тип облікового запису</h1>
      <div className="flex gap-4">
        <Button
          onClick={() => onSelect("ORGANIZATION")}
          disabled={isLoading}
        >
          Організація
        </Button>
        <Button
          onClick={() => onSelect("CLIENT")}
          disabled={isLoading}
        >
          Клієнт
        </Button>
      </div>
    </div>
  );
};

export default SelectAccountType;
