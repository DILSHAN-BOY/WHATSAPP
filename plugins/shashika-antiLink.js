const { cmd } = require('../command');
const { readEnv } = require('../lib/database'); // To read config values dynamically

// === Link detection regex patterns ===
const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /https?:\/\/(?:api\.whatsapp\.com)\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?(youtube\.com|youtu\.be)\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi
];

cmd({
  on: "body"
}, async (conn, m, store, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    // === Read config from DB ===
    const config = await readEnv();

    // === Check for links ===
    const containsLink = linkPatterns.some(pattern => pattern.test(body));
    if (!containsLink) return;

    // === INBOX MODE ===
    if (!isGroup) {
      if (config.INBOX_ANTILINK === 'true') {
        console.log(`[⚠️ Inbox AntiLink] ${sender}: ${body}`);
        try {
          await conn.sendMessage(from, { delete: m.key });
        } catch (err) {
          console.error("Failed to delete inbox message:", err);
        }
        await conn.sendMessage(from, {
          text: `🚫 *Links are not allowed in inbox!* 🚫`
        });
      }
      return;
    }

    // === GROUP MODE ===
    if (config.ANTI_LINK !== 'true') return; // Global/group antilink control

    // Skip if not bot admin or sender is admin
    if (!isBotAdmins || isAdmins) return;

    console.log(`[⚠️ Group AntiLink] ${sender}: ${body}`);

    // Delete message
    try {
      await conn.sendMessage(from, { delete: m.key });
    } catch (err) {
      console.error("Failed to delete group link message:", err);
    }

    // Send warning
    await conn.sendMessage(from, {
      text: `⚠️ *LINK DETECTED*\n\n@${sender.split('@')[0]}, links are not allowed in this group!`,
      mentions: [sender]
    });

  } catch (err) {
    console.error("Anti-link error:", err);
    reply("❌ Error while processing anti-link system.");
  }
});
