const fs = require('fs');
const axios = require('axios');
const { cmd } = require('../command');



cmd({
    pattern: "ai",
    alias: ["bot", "dj", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await reply(`🤖 *AI Response:*\n\n${data.message}`);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        await reply(`🧠 *OpenAI Response:*\n\n${data.result}`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        await reply(`🧠 *DeepSeek AI Response:*\n\n${data.answer}`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});
// === GEMINI API CONFIG ===
const GEMINI_API_KEY = 'AIzaSyC8pSIvRTtYS-ZghDZWWPUY360gEFB37hM'; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// === CHATBOT STATUS ===
let chatbotEnabled = false;

// ==================================================
// 🔹 CHATBOT CONTROL COMMAND (ON / OFF / STATUS)
// ==================================================
cmd({
  pattern: "chatbot",
  desc: "Turn chatbot on, off, or check status",
  react: "🤖",
  category: "ai",
  use: ".chatbot on / off / status",
  filename: __filename
}, async (conn, mek, m, { reply, args }) => {
  const option = (args[0] || "").toLowerCase();

  // Turn ON chatbot
  if (option === "on") {
    chatbotEnabled = true;
    reply("✅ *Chatbot Activated!* Now I’ll reply to every message automatically 🤖✨");
    return;
  }

  // Turn OFF chatbot
  if (option === "off") {
    chatbotEnabled = false;
    reply("🛑 *Chatbot Deactivated!* I’ll stop auto replying.");
    return;
  }

  // Show chatbot status
  if (option === "status") {
    const status = chatbotEnabled ? "🟢 *ON*" : "🔴 *OFF*";
    reply(`🤖 *Chatbot Status:* ${status}`);
    return;
  }

  // Invalid option
  reply("⚙️ Usage: `.chatbot on` | `.chatbot off` | `.chatbot status`");
});

// ==================================================
// 🔹 AUTO CHATBOT MESSAGE HANDLER
// ==================================================
cmd({
  on: "message"
}, async (conn, mek, m, { reply, body, sender, pushname }) => {
  try {
    // If chatbot is disabled → ignore
    if (!chatbotEnabled) return;

    // Ignore commands (start with .)
    if (!body || body.startsWith(".")) return;

    // === Gemini Prompt ===
    const prompt = `
    My name is ${pushname}.
    Your name is bot AI.
    You are a smart and friendly WhatsApp assistant created by shashika.
    Reply in the same language I use, naturally like a human, and include meaningful emojis.
    My message: ${body}
    `;

    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) return;

    await reply(aiResponse);

  } catch (error) {
    console.error("🤖 Chatbot Error:", error.response?.data || error.message);
  }
});    
        
