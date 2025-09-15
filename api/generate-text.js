import fetch from 'node-fetch';

export default async function handler(request, response) {
  // Получаем API-ключ из переменной окружения Vercel.
  // Это самый безопасный способ хранения ключа.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API key is not set.' });
  }

  // Получаем данные, отправленные с вашего фронтенда (index.html).
  // Эти данные содержат вопрос пользователя и системные инструкции для ИИ.
  const { userQuery, systemPrompt } = request.body;

  // Формируем полезную нагрузку (payload) для запроса к Gemini API.
  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  let retries = 0;
  const maxRetries = 3;
  const initialDelay = 1000;

  // Функция для повторных попыток при ошибке (например, слишком много запросов).
  const fetchWithRetry = async (url, options) => {
    try {
      const apiResponse = await fetch(url, options);
      if (apiResponse.status === 429) {
        if (retries < maxRetries) {
          retries++;
          const delay = initialDelay * Math.pow(2, retries - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options);
        } else {
          throw new Error('Too many requests. Please try again later.');
        }
      }
      if (!apiResponse.ok) {
        throw new Error(`API call failed with status: ${apiResponse.status}`);
      }
      return apiResponse;
    } catch (error) {
      throw error;
    }
  };

  try {
    const apiResponse = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await apiResponse.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "Молнии сейчас заняты на Олимпе. Попробуй позже.";

    // Отправляем ответ обратно на ваш фронтенд.
    response.status(200).json({ text });

  } catch (error) {
    console.error('Failed to get AI response:', error);
    response.status(500).json({ error: 'Failed to fetch from Gemini API.' });
  }
}

