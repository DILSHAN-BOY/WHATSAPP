const { cmd } = require('../command');
const axios = require('axios');
const { readEnv } = require('../lib/database'); // 🔥 MongoDB environment reader

// 🧩 Utility function to check if AI is enabled
async function checkAIEnabled(reply) {
    const env = await readEnv();
    if (env.AUTO_AI !== 'true') {
        await reply("🧠 *AI system is currently turned OFF.*\nUse `.update AUTO_AI: true` to enable it.");
        return false;
    }
    return true;
}

// =====================================
// 🤖 MAIN GPT / AI COMMAND
// =====================================
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
        // ✅ Check if AI is enabled in MongoDB
        if (!(await checkAIEnabled(reply))) return;

        if (!q) return reply("💬 Please provide a message for the AI.\nExample: `.ai Hello`");

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await react("✅");
        await reply(`🤖 *AI Response:*\n\n${data.message}`);

    } catch (e) {
        console.error("Error in AI command:", e);
        await react("⚠️");
        reply("An error occurred while communicating with the AI.");
    }
});


// =====================================
// 🧠 OPENAI GPT-3 STYLE
// =====================================
cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI model",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!(await checkAIEnabled(reply))) return;

        if (!q) return reply("💬 Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        await react("✅");
        await reply(`🧠 *OpenAI Response:*\n\n${data.result}`);

    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("⚠️");
        reply("An error occurred while communicating with OpenAI.");
    }
});


// =====================================
// 🔮 DEEPSEEK COMMAND
// =====================================
cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🔮",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!(await checkAIEnabled(reply))) return;

        if (!q) return reply("💬 Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        await react("✅");
        await reply(`🔮 *DeepSeek AI Response:*\n\n${data.answer}`);

    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("⚠️");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});
