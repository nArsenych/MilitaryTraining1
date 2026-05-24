import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Rocket, TriangleAlert } from "lucide-react";

interface AlertBannerProps {
  isCompleted: boolean;
  requiredFieldsCount: number;
  missingFieldsCount: number;
}

const AlertBanner = ({ isCompleted, requiredFieldsCount, missingFieldsCount }: AlertBannerProps) => {
  return (
    <Alert className="my-4" variant={isCompleted ? "complete" : "destructive"}>
      {isCompleted ? <Rocket className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
      <AlertTitle className="text-xs font-medium">
        {isCompleted
          ? "Усі обов'язкові поля заповнено"
          : `Не заповнено ${missingFieldsCount} з ${requiredFieldsCount} обов'язкових полів`}
      </AlertTitle>
      <AlertDescription className="text-xs">
        {isCompleted
          ? "Курс готовий до публікації"
          : "Публікація доступна лише після заповнення всіх обов'язкових полів"}
      </AlertDescription>
    </Alert>
  );
};

export default AlertBanner;
