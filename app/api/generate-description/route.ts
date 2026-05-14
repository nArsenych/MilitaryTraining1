import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, edrpou, address, phone, email, instagram, telegram, facebook } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Назва організації обов'язкова" },
        { status: 400 }
      );
    }

    const prompt = `Ти — копірайтер, який пише тексти від імені організацій військової підготовки в Україні.

Твоє завдання: написати опис організації від першої особи множини ("ми", "наша організація") українською мовою (5-8 речень). Цей текст буде розміщений на сторінці профілю організації.

ВАЖЛИВО:
- Якщо ти знаєш цю організацію — використай реальні факти: рік заснування, історію, досягнення, напрямки діяльності, відомих інструкторів чи партнерів.
- Якщо організація має код ЄДРПОУ — вона зареєстрована офіційно, можеш ненав'язливо згадати це як перевагу.
- Якщо ти НЕ знаєш цю організацію — створи опис виключно на основі наданих даних, без вигадування фактів.
- Пиши від імені організації: "Ми спеціалізуємося...", "Наша команда...", "Ми пропонуємо...", "Запрошуємо вас...".
- Опис має включати: хто ми та наша місія, чим займаємося та основні напрямки підготовки, чому варто обрати саме нас, запрошення до співпраці або запису.
- Тон: професійний, дружній, впевнений. Ніби організація звертається до потенційного учасника курсу.
- НЕ використовуй кліше, водянисті фрази та канцеляризми.

Дані організації:
- Назва: ${name}
${edrpou ? `- Код ЄДРПОУ: ${edrpou} (офіційно зареєстрована)` : ""}
${address ? `- Адреса: ${address}` : ""}
${phone ? `- Телефон: ${phone}` : ""}
${email ? `- Email: ${email}` : ""}
${instagram ? `- Instagram: ${instagram}` : ""}
${telegram ? `- Telegram: ${telegram}` : ""}
${facebook ? `- Facebook: ${facebook}` : ""}

Напиши лише текст опису від імені організації, без заголовків, лапок та приміток. Починай одразу.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", await response.text());
      return NextResponse.json(
        { error: "Не вдалося згенерувати опис" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ description });
  } catch (error) {
    console.error("[GENERATE_DESCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}