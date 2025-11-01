const { readEnv } = require('../lib/database');
const { cmd } = require('../command');

cmd({
  pattern: "alive",
  desc: "Check bot online or no.",
  react: "🍀",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    const config = await readEnv();

    // fallback values (avoid undefined errors)
    const aliveImage = config.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg";
    const aliveMsg = config.ALIVE_MSG || "✅ *Bot is online and working fine!*";

    await conn.sendMessage(from, {
      image: { url: aliveImage },
      caption: aliveMsg
    }, { quoted: mek });

  } catch (e) {
    console.log("Alive Error =>", e);
    reply("❌ Alive command error: " + e.message);
  }
});
