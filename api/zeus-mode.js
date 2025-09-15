import { GoogleGenerativeAI } from "@google/generative-ai";

// Инициализируем API с ключом из переменных окружения Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Экспортируем функцию-обработчик для Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  const { userQuery, systemPrompt } = req.body;

  if (!userQuery) {
    return res.status(400).json({ message: 'Отсутствует текст запроса' });
  }

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(userQuery);
    const text = result.response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error('Ошибка при обращении к Gemini API:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
