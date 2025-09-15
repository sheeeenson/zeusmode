// Этот файл отвечает за вызовы к Gemini API.
// Для того чтобы он работал, вам нужно вставить ваш API-ключ ниже.
// Если вы используете эту программу в среде Canvas, ключ будет предоставлен автоматически.
// В противном случае, вставьте свой ключ, полученный с Google AI Studio.
const API_KEY = process.env.VERCEL_GEMINI_API_KEY; // Вставьте ваш ключ здесь, если это необходимо

/**
 * Выполняет вызов к API Gemini.
 * @param {string} prompt - Текст запроса для генерации.
 * @param {boolean} isAudio - Флаг, указывающий, нужно ли генерировать аудио.
 * @param {string} voice - Голос для генерации аудио.
 * @returns {Promise<string|ArrayBuffer>} Сгенерированный текст или аудиоданные.
 */
export async function callGeminiApi(prompt, isAudio = false, voice = "Kore") {
    let url = "";
    let payload = {};
    const model = isAudio ? "gemini-2.5-flash-preview-tts" : "gemini-2.5-flash-preview-05-20";

    if (isAudio) {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice }
                    }
                }
            },
            model: model
        };
    } else {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Ошибка API:', errorData);
            throw new Error(`Ошибка API с кодом состояния: ${response.status}`);
        }

        const result = await response.json();
        if (isAudio) {
            const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioData) {
                throw new Error("Не удалось получить аудиоданные из ответа.");
            }
            return audioData;
        } else {
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Не удалось получить текст из ответа.");
            }
            return text;
        }
    } catch (e) {
        console.error("Ошибка при вызове API:", e);
        throw new Error("Не удалось выполнить запрос к API.");
    }
}
