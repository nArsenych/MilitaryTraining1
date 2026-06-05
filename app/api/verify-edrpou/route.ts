import { getSession } from "@/lib/auth";
import { checkRateLimit, rateLimitResetMinutes } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const RATE_LIMIT = { maxRequests: 20, windowMs: 60 * 60 * 1000 };

const TRUSTED_EDRPOU = new Set(
  (process.env.TRUSTED_EDRPOU_CODES ?? "45709760").split(",").map((c) => c.trim()).filter(Boolean)
);

type SanctionEntry = { id: number; name: string; sanctions_type: string };
type SanctionsResult = { hasSanctions: boolean; sanctions: SanctionEntry[] };

function extractItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "items", "result", "list"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

async function checkNazkSanctions(edrpou: string): Promise<SanctionsResult> {
  for (const domain of ["sanctions.nazk.gov.ua", "api-sanctions.nazk.gov.ua"]) {
    try {
      const res = await fetch(`https://${domain}/api/v2/sanction?code=${edrpou}`, {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.data?.length > 0) {
        return {
          hasSanctions: true,
          sanctions: data.data.map((s: any) => ({
            id: s.id,
            name: s.name_ukr || s.name,
            sanctions_type: s.sanctions_type || "Санкції РНБО",
          })),
        };
      }
      break;
    } catch {}
  }
  return { hasSanctions: false, sanctions: [] };
}

async function checkSpendingRegistry(edrpou: string): Promise<boolean> {
  const urls = [
    `https://api.spending.gov.ua/api/v2/disposers/search?edrpou=${edrpou}`,
    `https://api.spending.gov.ua/api/v2/disposers?edrpou=${edrpou}`,
    `https://api.spending.gov.ua/api/v1/disposers/search?edrpou=${edrpou}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(7000),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (extractItems(data).length > 0) return true;
      const obj = data as Record<string, unknown>;
      const count = (obj.pager as any)?.count ?? (obj.pager as any)?.total ?? obj.total_count ?? obj.count;
      if (Number(count) > 0) return true;
    } catch {}
  }
  return false;
}

async function checkGroqAI(edrpou: string): Promise<boolean> {
  if (!process.env.GROQ_API_KEY) return false;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Перевір чи існує українська організація з кодом ЄДРПОУ.
Відповідай ТІЛЬКИ одним словом: YES або NO.
YES — тільки якщо ти ТОЧНО ВПЕВНЕНИЙ що знаєш цю організацію.
NO — якщо не знаєш або не впевнений. Краще NO ніж помилкове YES.`,
          },
          { role: "user", content: `ЄДРПОУ: ${edrpou}` },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const answer = (data.choices?.[0]?.message?.content || "").trim().toUpperCase();
    return answer === "YES";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const rl = await checkRateLimit(session.userId, "verify-edrpou", RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Ліміт перевірок вичерпано. Спробуйте через ${rateLimitResetMinutes(rl.resetAt)} хв.` },
        { status: 429 }
      );
    }

    const edrpou = String((await req.json()).edrpou).trim();
    if (!edrpou || !/^\d{8}$/.test(edrpou)) {
      return NextResponse.json({ error: "Код ЄДРПОУ має містити рівно 8 цифр" }, { status: 400 });
    }

    const [sanctionsResult, spendingExists] = await Promise.all([
      checkNazkSanctions(edrpou),
      checkSpendingRegistry(edrpou),
    ]);

    const exists = TRUSTED_EDRPOU.has(edrpou) || spendingExists || await checkGroqAI(edrpou);

    return NextResponse.json({ exists, hasSanctions: sanctionsResult.hasSanctions, sanctions: sanctionsResult.sanctions });
  } catch (error) {
    console.error("[VERIFY_EDRPOU]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
