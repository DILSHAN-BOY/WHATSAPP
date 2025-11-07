const fs = require('fs');
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');

cmd({
  pattern: "menu",
  react: "📌",
  alias: ["allmenu", "help"],
  desc: "Show command menu with selection buttons",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, pushname }) => {
  try {
    const config = await readEnv();
    const prefix = config.PREFIX || ".";
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";

    const user = pushname || m.sender.split('@')[0];

    // Create Sections for List UI
    const sections = [
      {
        title: "📥 DOWNLOAD COMMANDS",
        rows: commands
          .filter(c => c.category == "download")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      },
      {
        title: "⚙️ MAIN COMMANDS",
        rows: commands
          .filter(c => c.category == "main")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      },
      {
        title: "👥 GROUP COMMANDS",
        rows: commands
          .filter(c => c.category == "group")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      },
      {
        title: "🤖 AI COMMANDS",
        rows: commands
          .filter(c => c.category == "ai")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      },
      {
        title: "👑 OWNER COMMANDS",
        rows: commands
          .filter(c => c.category == "owner")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      },
      {
        title: "🔍 SEARCH COMMANDS",
        rows: commands
          .filter(c => c.category == "search")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      },
      {
        title: "🧰 TOOLS COMMANDS",
        rows: commands
          .filter(c => c.category == "tools")
          .map(c => ({ title: `${prefix}${c.pattern}`, rowId: `${prefix}${c.pattern}` }))
      }
    ];

    // List Message Format
    const listMessage = {
      text: `👋 𝐇𝐞𝐲 *${user}*\n\nSelect a command category below 👇`,
      footer: `⚛ ${botName} | Powered By ${owner}`,
      title: `📌 CLICK HERE`,
      buttonText: "SELECT MENU",
      sections
    };

    await conn.sendMessage(from, listMessage, { quoted: mek });

  } catch (err) {
    console.error(err);
    conn.sendMessage(from, { text: "❌ Menu Error: " + err.message }, { quoted: mek });
  }
});
