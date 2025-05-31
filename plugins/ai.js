const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({ apiKey: "ISI_API_KEY_OPENAI" });
const openai = new OpenAIApi(config);

module.exports = async (sock, msg, text, from) => {
    if (!text.startsWith('.ai')) return;
    const prompt = text.replace('.ai', '').trim();
    if (!prompt) return sock.sendMessage(from, { text: 'Mau tanya apa, kak?' });

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
    });

    const reply = response.data.choices[0].message.content;
    await sock.sendMessage(from, { text: reply });
};
