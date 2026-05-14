"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import axios from "axios";

interface VerificationResult {
  exists: boolean;
  hasSanctions: boolean;
  sanctions: { id: number; name: string; sanctions_type: string }[];
}

interface EdrpouVerificationProps {
  edrpou: string;
  setEdrpou: (value: string) => void;
  onVerified?: (result: VerificationResult) => void;
}

const EdrpouVerification = ({ edrpou, setEdrpou, onVerified }: EdrpouVerificationProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!edrpou || edrpou.length !== 8) {
      setError("Код ЄДРПОУ має містити 8 цифр");
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("/api/verify-edrpou", { edrpou });
      setResult(res.data);
      onVerified?.(res.data);
    } catch {
      setError("Помилка перевірки. Спробуйте ще раз.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Код ЄДРПОУ</label>
      <div className="flex gap-2">
        <Input
          value={edrpou}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 8);
            setEdrpou(val);
            setResult(null);
            setError(null);
          }}
          placeholder="12345678"
          maxLength={8}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleVerify}
          disabled={isChecking || edrpou.length !== 8}
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Перевірка...
            </>
          ) : (
            "Перевірити"
          )}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {result && (
        <div className="mt-3">
          {result.hasSanctions && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-100 border border-red-300">
              <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Організація під санкціями!
                </p>
                {result.sanctions.map((s) => (
                  <p key={s.id} className="text-xs text-red-600 mt-1">
                    {s.name} — {s.sanctions_type}
                  </p>
                ))}
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Реєстрація заборонена.
                </p>
              </div>
            </div>
          )}

          {result.exists && !result.hasSanctions && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-100 border border-green-300">
              <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Організацію підтверджено ✓
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ЄДРПОУ {edrpou} знайдено в реєстрі. Санкцій не виявлено.
                </p>
              </div>
            </div>
          )}

          {!result.exists && !result.hasSanctions && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-100 border border-yellow-300">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-700">
                  Організацію не знайдено
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  ЄДРПОУ {edrpou} не знайдено в реєстрі. Перевірте правильність коду.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EdrpouVerification;