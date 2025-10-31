const { cmd } = require('../command');
const os = require('os');
const { runtime } = require('../lib/functions');
const {readEnv} = require('../lib/database');

cmd({
    pattern: "agni",
    alias: ["a", "online", "AGNI"],
    desc: "Check if bot is alive and running",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());

        const caption = `
╭━━〔 🤖 *${config.BOT_NAME} STATUS* 〕━━⬣
┃ 🟢 *Bot is Active & Online!*
┃
┃ 👑 *Owner:* ${config.OWNER_NAME}
┃ 🛠️ *Prefix:* [ ${config.PREFIX} ]
┃ ⚙️ *Mode:* [ ${config.MODE} ]
┃ 💾 *RAM:* ${heapUsed}MB / ${totalMem}MB
┃ 🖥️ *Host:* ${os.hostname()}
┃ ⏱️ *Uptime:* ${uptime}
╰━━━━━━━━━━━━━━⬣
📝 *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧*
        `.trim();

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 1000,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '123450987650123450@newsletter',
                    newsletterName: 'SHASHIKA DILSHAN',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
            
