import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

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


export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const edrpou = String(body.edrpou).trim();

    if (!edrpou || !/^\d{8}$/.test(edrpou)) {
      return NextResponse.json(
        { error: "Код ЄДРПОУ має містити рівно 8 цифр" },
        { status: 400 }
      );
    }

    let exists = false;
    let hasSanctions = false;
    let sanctions: { id: number; name: string; sanctions_type: string }[] = [];

    // 1. Санкції НАЗК
    for (const domain of ["sanctions.nazk.gov.ua", "api-sanctions.nazk.gov.ua"]) {
      try {
        const res = await fetch(`https://${domain}/api/v2/sanction?code=${edrpou}`, {
          signal: AbortSignal.timeout(5000),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.length > 0) {
            hasSanctions = true;
            sanctions = data.data.map((s: any) => ({
              id: s.id,
              name: s.name_ukr || s.name,
              sanctions_type: s.sanctions_type || "Санкції РНБО",
            }));
          }
          break;
        }
      } catch {}
    }

    // 2. Перевірка наявності в реєстрі — пробуємо кілька ендпоінтів spending.gov.ua
    const spendingUrls = [
      `https://api.spending.gov.ua/api/v2/disposers/search?edrpou=${edrpou}`,
      `https://api.spending.gov.ua/api/v2/disposers?edrpou=${edrpou}`,
      `https://api.spending.gov.ua/api/v1/disposers/search?edrpou=${edrpou}`,
    ];

    for (const url of spendingUrls) {
      if (exists) break;
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(7000),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) continue;

        const data = await res.json();
        const items = extractItems(data);

        if (items.length > 0) {
          exists = true;
          break;
        }

        if (!exists && data && typeof data === "object") {
          const obj = data as Record<string, unknown>;
          const count =
            (obj.pager as any)?.count ??
            (obj.pager as any)?.total ??
            obj.total_count ??
            obj.count;
          if (Number(count) > 0) {
            exists = true;
          }
        }
      } catch {}
    }

    // 3. Якщо spending не знайшов — перевірка через Groq AI
    if (!exists && process.env.GROQ_API_KEY) {
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

        if (res.ok) {
          const data = await res.json();
          const answer = (data.choices?.[0]?.message?.content || "").trim().toUpperCase();
          if (answer === "YES") {
            exists = true;
          }
        }
      } catch {}
    }

    return NextResponse.json({ exists, hasSanctions, sanctions });
  } catch (error) {
    console.error("[VERIFY_EDRPOU]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
