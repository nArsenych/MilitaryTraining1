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

    const contacts = [
      address && `Адреса: ${address}`,
      phone && `Телефон: ${phone}`,
      email && `Email: ${email}`,
      instagram && `Instagram: ${instagram}`,
      telegram && `Telegram: ${telegram}`,
      facebook && `Facebook: ${facebook}`,
    ].filter(Boolean).join("\n");

    const prompt = `Ти — копірайтер, який пише описи для українських організацій, що проводять курси військової підготовки на платформі MilitaryTraining.

Завдання: написати опис від першої особи множини ("ми", "наша організація") українською мовою, 5–7 речень. Текст розміщується на публічній сторінці профілю організації.

ПРАВИЛА (дотримуйся суворо):
1. Уважно проаналізуй назву та визнач спеціалізацію: тактична підготовка, вогнева підготовка, медична, виживання, рукопашний бій, психологічна стійкість, водіння тощо — і буди точним у цьому.
2. Категорично НЕ вигадуй конкретних фактів: рік заснування, кількість випускників, нагороди, відомих партнерів — якщо їх немає в даних нижче. Замість цього — говори про підхід і цінності.
3. Структура: хто ми і наша спеціалізація → чим конкретно займаємося → наш підхід або перевага → заклик до дії.
4. Тон: чіткий, впевнений, по-військовому лаконічний. Без кліше, порожніх прикметників і канцеляризмів.
5. Якщо надані контакти — у фіналі органічно згадай, де можна записатися або дізнатися більше.

Дані організації:
- Назва: ${name}
${edrpou ? `- ЄДРПОУ: ${edrpou} (офіційно зареєстрована)` : ""}
${contacts || "- Контакти не вказані"}

Напиши лише текст опису, без заголовків, лапок і приміток. Починай одразу з першого речення.`;

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
        max_tokens: 600,
        temperature: 0.5,
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