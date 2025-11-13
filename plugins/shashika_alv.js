const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const { readEnv } = require('../lib/database');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "🍃",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
const config = await readEnv();
        const status = `
╭───🍀 *${config.BOT_NAME}* ☘️───◉
│✨ *🍀Bot is Active & Online!☘️*
│
│🧠 *Owner:* ${config.OWNER_NAME}
│⚡ *Version:* 5.0.0 Pro
│📝 *Prefix:* [${config.PREFIX}]
│📳 *Mode:* [${config.MODE}]
│💾 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥️ *Host:* ${os.hostname()}
│⌛ *Uptime:* ${runtime(process.uptime())}
╰────────────────────◉⌲
> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 ${config.OWNER_ NAME}`;

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '123450987650123450@newsletter',
                    newsletterName: 'META AI',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

