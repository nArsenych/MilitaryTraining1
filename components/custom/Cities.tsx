"use client"

import { City } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { Home } from "lucide-react";

interface CitiesProps {
  cities: City[];
}

const Cities = ({ cities }: CitiesProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const onClick = (cityId: string | null) => {
    router.push(cityId ? `/cities/${cityId}` : "/cities");
  };

  const onHomeClick = () => {
    router.push("/");
  };

  const currentCityId = pathname.startsWith('/cities/') 
    ? pathname.split('/cities/')[1] 
    : null;

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
        variant={currentCityId === null ? "default" : "outline"}
        onClick={() => onClick(null)}
      >
        Всі міста
      </Button>
      {cities.map((city) => (
        <Button
          key={city.id}
          variant={currentCityId === city.id ? "default" : "outline"}
          onClick={() => onClick(city.id)}
        >
          {city.name}
        </Button>
      ))}
    </div>
  );
};

export default Cities;