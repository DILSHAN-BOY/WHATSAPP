const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

let deletedMessages = {}; // In-memory message store

// === Capture all incoming messages ===
cmd({
  on: "message"
}, async (conn, m, store, { from }) => {
  if (!m.message || m.key.fromMe) return;
  if (!deletedMessages[from]) deletedMessages[from] = {};
  deletedMessages[from][m.key.id] = m;
});

// === Detect deleted messages ===
cmd({
  on: "message.delete"
}, async (conn, m, store, { from, reply }) => {
  try {
    const config = await readEnv();
    if (config.ANTI_DELETE !== 'true') return;

    const deleted = m?.key;
    if (!deleted?.id) return;

    const chatId = from;
    const deletedId = deleted.id;
    const original = deletedMessages[chatId]?.[deletedId];
    if (!original) return;

    const sender = original.key.participant || original.key.remoteJid;
    const type = Object.keys(original.message)[0];
    const msg = original.message[type];

    await conn.sendMessage(chatId, {
      text: `⚠️ *Message deleted by:* @${sender.split('@')[0]}\n\n*Recovered below 👇*`,
      mentions: [sender]
    });

    // === Handle media or text ===
    if (msg.imageMessage || msg.videoMessage || msg.audioMessage || msg.documentMessage || msg.stickerMessage) {
      const buffer = await conn.downloadMediaMessage(original);
      if (msg.imageMessage) {
        await conn.sendMessage(chatId, { image: buffer, caption: msg.imageMessage.caption || '' }, { quoted: original });
      } else if (msg.videoMessage) {
        await conn.sendMessage(chatId, { video: buffer, caption: msg.videoMessage.caption || '' }, { quoted: original });
      } else if (msg.audioMessage) {
        await conn.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mpeg', ptt: msg.audioMessage.ptt || false }, { quoted: original });
      } else if (msg.documentMessage) {
        await conn.sendMessage(chatId, { document: buffer, fileName: msg.documentMessage.fileName || 'document', mimetype: msg.documentMessage.mimetype }, { quoted: original });
      } else if (msg.stickerMessage) {
        await conn.sendMessage(chatId, { sticker: buffer }, { quoted: original });
      }
    } else if (msg.conversation) {
      await conn.sendMessage(chatId, { text: msg.conversation }, { quoted: original });
    } else if (msg.extendedTextMessage) {
      await conn.sendMessage(chatId, { text: msg.extendedTextMessage.text }, { quoted: original });
    } else {
      await conn.copyNForward(chatId, original, true);
    }

  } catch (err) {
    console.error("AntiDelete Error:", err);
    reply("❌ Error in anti-delete system.");
  }
});
