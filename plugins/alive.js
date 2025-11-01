const { readEnv } = require('../lib/database');
const { cmd } = require('../command');

cmd({
  pattern: "alive",
  desc: "Check bot online or not.",
  react: "🍀",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
  try {
    const config = await readEnv();
    const aliveImg = config?.ALIVE_IMG || 'https://files.catbox.moe/ue4ppc.jpg';
    const aliveMsg = config?.ALIVE_MSG || '⚡ Bot is Alive!';

    await conn.sendMessage(from, {
      image: { url: aliveImg },
      caption: aliveMsg
    }, { quoted: mek });

  } catch (e) {
    console.error('Alive command error:', e);
    reply('❌ Alive command error:\n' + e.message);
  }
});
