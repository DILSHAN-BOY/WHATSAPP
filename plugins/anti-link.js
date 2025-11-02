const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

cmd({
  on: "body"
}, async (conn, m, store, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    //=== Read Anti-Link setting from DB ===//
    const config = await readEnv();
    if (config.ANTI_LINK !== 'true') return;

    //=== Initialize warnings memory ===//
    if (!global.warnings) global.warnings = {};

    //=== Link patterns ===//
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
      /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
      /https?:\/\/(?:www\.)?\w+\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?(twitter|linkedin|reddit|discord|twitch|vimeo|dailymotion|medium)\.com\/\S+/gi
    ];

    const containsLink = linkPatterns.some(p => p.test(body));
    if (!containsLink) return;

    console.log(`[⚠️ Anti-Link] ${sender}: ${body}`);

    //=== GROUP HANDLING ===//
    if (isGroup) {
      if (isAdmins) return; // skip admins

      if (isBotAdmins) {
        try {
          await conn.sendMessage(from, { delete: m.key });
        } catch (err) {
          console.error("❌ Delete failed:", err);
        }
      }

      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const count = global.warnings[sender];

      if (count < 3) {
        await conn.sendMessage(from, {
          text: `🚫 *⌲LINKS ARE NOT ALLOWED HERE!*\n\n` +
                `*╭───☣️─⬡ WARNING SYSTEM ⬡───☣️─*\n` +
                `*├▢ USER:* @${sender.split('@')[0]}\n` +
                `*├▢ COUNT:* ${count}\n` +
                `*├▢ LIMIT:* 3\n` +
                `*╰─────☣️──────────☣️───*`,
          mentions: [sender]
        });
      } else {
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *HAS BEEN REMOVED (3 WARNINGS)* 🚫`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }

    //=== INBOX (PRIVATE CHAT) HANDLING ===//
    else {
      await conn.sendMessage(from, {
        text: `⚠️ *Anti-Link Active*\n\n🚫 Links are not allowed here!\n> @${sender.split('@')[0]}`,
        mentions: [sender]
      });
      console.log(`🔒 Private Anti-Link Triggered for ${sender}`);
    }

  } catch (error) {
    console.error("Anti-Link Error:", error);
    reply("❌ Error while checking links.");
  }
});
