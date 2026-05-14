import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

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

    // 1. Перевірка санкцій НАЗК
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

    // 2. Перевірка через spending.gov.ua
    try {
      const res = await fetch(
        `https://api.spending.gov.ua/api/v2/disposers/search?edrpou=${edrpou}`,
        { signal: AbortSignal.timeout(5000), headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.some((c: any) => String(c.edrpou) === edrpou)) {
          exists = true;
        }
      }
    } catch {}

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
NO — якщо не знаєш або не впевнений. Краще NO ніж помилкове YES.`
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