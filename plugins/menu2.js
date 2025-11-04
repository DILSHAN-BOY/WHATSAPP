const fs = require('fs');
const os = require('os');
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
  pattern: "menu2",
  alias: ["list", "panel"],
  react: "📜",
  desc: "Interactive command menu",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, pushname, reply }) => {
  try {
    const config = await readEnv();
    const botName = config.BOT_NAME || "Black Wolf";
    const owner = config.OWNER_NAME || "Shashika";
    const menuImg = config.MENU_IMAGE_URL || "https://files.catbox.moe/4kux2y.jpg";

    const user = pushname || m.sender.split('@')[0];
    const uptime = runtime(process.uptime());
    const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);

    // ─── MENU LISTS BY CATEGORY ─── //
    const menu = {
      main: '', search: '', download: '', group: '', owner: '', tools: ''
    };

    for (let c of commands) {
      if (menu[c.category]) {
        menu[c.category] += `⬡ ${c.pattern}\n`;
      }
    }

    // ─── INITIAL MENU ─── //
    const caption = `
👋 Hello *${user}*!

╭───〘 ⚛ ${botName} MENU ⚛ 〙───╮
│ ⏳ *Uptime:* ${uptime}
│ 💾 *RAM:* ${usedMem}/${totalMem}MB
│ 👑 *Owner:* ${owner}
╰────────────────────╯

📜 *Select a section:*
1️⃣ MAIN
2️⃣ SEARCH
3️⃣ DOWNLOAD
4️⃣ GROUP
5️⃣ OWNER
6️⃣ TOOLS

_Reply with the number (1–6) to view commands._
`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: menuImg },
      caption,
    }, { quoted: mek });

    // === WAIT FOR USER REPLY === //
    const collector = async (msg) => {
      try {
        if (!msg.message?.extendedTextMessage?.text) return;
        const text = msg.message.extendedTextMessage.text.trim();

        if (msg.key.remoteJid === from &&
          msg.message.extendedTextMessage.contextInfo?.stanzaId === sentMsg.key.id) {

          let section = "";
          switch (text) {
            case "1":
              section = `🔧 *MAIN COMMANDS*\n\n${menu.main || "No commands."}`;
              break;
            case "2":
              section = `🔍 *SEARCH COMMANDS*\n\n${menu.search || "No commands."}`;
              break;
            case "3":
              section = `📥 *DOWNLOAD COMMANDS*\n\n${menu.download || "No commands."}`;
              break;
            case "4":
              section = `👥 *GROUP COMMANDS*\n\n${menu.group || "No commands."}`;
              break;
            case "5":
              section = `👑 *OWNER COMMANDS*\n\n${menu.owner || "No commands."}`;
              break;
            case "6":
              section = `🛠️ *TOOLS COMMANDS*\n\n${menu.tools || "No commands."}`;
              break;
            default:
              return conn.sendMessage(from, { text: "⚠️ Invalid selection. Please send a number (1–6)." }, { quoted: msg });
          }

          await conn.sendMessage(from, { text: section }, { quoted: msg });
        }
      } catch (e) {
        console.error("Menu2 Reply Error:", e);
      }
    };

    conn.ev.once('messages.upsert', async (event) => {
      const msg = event.messages[0];
      await collector(msg);
    });

  } catch (e) {
    console.error("Menu2 Error:", e);
    reply("❌ An error occurred while loading the menu.");
  }
});
