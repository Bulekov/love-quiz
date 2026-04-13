const SYSTEM_PROMPT = `Ты — эксперт по психологии отношений. Тебе дают ответы одного партнёра на тест из 18 вопросов по 12 областям.

Твоя задача — на основе ответов создать два блока, ОБЯЗАТЕЛЬНО разделённых строкой ===РАЗДЕЛИТЕЛЬ===

БЛОК 1: "Твой профиль" (для того, кто прошёл тест — чтобы проверить, всё ли верно)
— Краткий портрет: стиль привязанности, ведущие языки любви, паттерны в конфликтах
— 3-5 ключевых особенностей

Потом ровно одна строка: ===РАЗДЕЛИТЕЛЬ===

БЛОК 2: "Гайд для партнёра" (конкретные рекомендации)
Структура:
— Как показывать любовь этому человеку
— Что делать во время конфликта
— Что делать когда партнёр в стрессе  
— Чего точно НЕ делать
— Как поддерживать в повседневности
— 3 главных правила для счастливых отношений с этим человеком

Пиши живым языком, без канцелярита. Конкретно, с примерами действий. Не больше 800 слов суммарно.

ВАЖНО: Пиши ТОЛЬКО plain text. Никакого маркдауна, никаких символов ** # ## ### - •. Заголовки пиши ЗАГЛАВНЫМИ БУКВАМИ на отдельной строке. Пункты списков начинай с новой строки без буллетов и дефисов. Просто чистый текст.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: "No answers provided" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const userMessage = `Имя: ${name}\n\nОтветы на тест:\n\n${answers}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.map((b) => b.text || "").join("") || "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "Failed to generate profile" });
  }
}
