const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

cmd({
  on: "message"
}, async (conn, m, store, { from, reply }) => {
  try {
    if (!m.message) return;

    const config = await readEnv();
    if (config.ANTI_VIEW_ONCE !== 'true') return;// ✅ OFF නම් skip

    const msgContent = m.message;
    const viewOnceType = Object.keys(msgContent)[0];
    if (viewOnceType !== "viewOnceMessageV2") return; // Only view-once

    const viewOnce = msgContent.viewOnceMessageV2;
    const innerType = Object.keys(viewOnce.message)[0];
    const media = viewOnce.message[innerType];
    const sender = m.key.participant || m.key.remoteJid;

    console.log(`[🔓 AntiViewOnce] Intercepted from ${sender}`);

    // Download view-once media
    const buffer = await conn.downloadMediaMessage(m);

    await conn.sendMessage(from, {
      text: `🔓 *ViewOnce Message Unlocked!*\n👤 Sender: @${sender.split('@')[0]}\n\n🪄 *Recovered below 👇*`,
      mentions: [sender]
    });

    // Re-send unlocked version based on media type
    if (innerType === "imageMessage") {
      await conn.sendMessage(from, { image: buffer, caption: media.caption || '' }, { quoted: m });
    } else if (innerType === "videoMessage") {
      await conn.sendMessage(from, { video: buffer, caption: media.caption || '' }, { quoted: m });
    } else if (innerType === "audioMessage") {
      await conn.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg', ptt: media.ptt || false }, { quoted: m });
    } else if (innerType === "documentMessage") {
      await conn.sendMessage(from, { document: buffer, fileName: media.fileName || 'unlocked', mimetype: media.mimetype }, { quoted: m });
    } else {
      await conn.sendMessage(from, { text: "⚠️ Unsupported view-once type detected!" }, { quoted: m });
    }

  } catch (err) {
    console.error("Anti ViewOnce Error:", err);
    reply("❌ Error unlocking view-once message.");
  }
});

// === Toggle command ===
cmd({
  pattern: "antiviewonce",
  desc: "Turn Anti View Once ON or OFF",
  category: "owner",
  use: ".antiviewonce on/off",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  try {
    const { updateEnv, readEnv } = require('../lib/database');
    const config = await readEnv();
    const input = (args[0] || '').toLowerCase();

    if (!['on', 'off'].includes(input)) {
      return reply(`⚙️ Anti ViewOnce currently: *${config.ANTI_VIEW_ONCE === 'true' ? 'ON' : 'OFF'}*\n\nUse:\n.antiviewonce on\n.antiviewonce off`);
    }

    await updateEnv({ ANTI_VIEW_ONCE: input === 'on' ? 'true' : 'false' });
    reply(`✅ Anti ViewOnce ${input === 'on' ? 'Activated 🔓' : 'Deactivated 🔒'}`);
  } catch (err) {
    console.error("Toggle Error:", err);
    reply("❌ Error updating Anti ViewOnce setting.");
  }
});
