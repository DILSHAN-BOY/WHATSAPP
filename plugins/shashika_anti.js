const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

// Anti-Bad Words System
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply,
  sender
}) => {
  try {
      const config = await readEnv();
    const badWords = ["wtf", "mia", "xxx", "fuck", 'sex', "huththa", "pakaya", 'ponnaya', "hutto"];

    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    const messageText = body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord && config.ANTI_BAD_WORD === "true") {
      await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
      await conn.sendMessage(from, { 'text': "🚫 ⚠️ BAD WORDS NOT ALLOWED ⚠️ 🚫" }, { 'quoted': m });
    }
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing the message.");
  }
});

cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
      const config = await readEnv();
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }

    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // List of link patterns to detect
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi, // WhatsApp links
      /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,  // WhatsApp API links
      /wa\.me\/\S+/gi,                                    // WhatsApp.me links
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,         // Telegram links
      /https?:\/\/(?:www\.)?\.com\/\S+/gi,                // Generic .com links
      /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,         // Twitter links
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,        // LinkedIn links
      /https?:\/\/(?:whatsapp\.com|channel\.me)\/\S+/gi,  // Other WhatsApp/channel links
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,          // Reddit links
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,         // Discord links
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,           // Twitch links
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,           // Vimeo links
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,     // Dailymotion links
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi           // Medium links
    
    ];

    // Check if message contains any forbidden links
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    // Only proceed if anti-link is enabled and link is detected
    if (containsLink && config.ANTI_LINK === 'true') {
      console.log(`Link detected from ${sender}: ${body}`);

      // Try to delete the message
      try {
        await conn.sendMessage(from, {
          delete: m.key
        });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // Update warning count for user
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];

      // Handle warnings
      if (warningCount < 4) {
        // Send warning message
        await conn.sendMessage(from, {
          text: `‎*⚠️LINKS ARE NOT ALLOWED⚠️*\n` +
                `*╭────⬡ WARNING ⬡────*\n` +
                `*├▢ USER :* @${sender.split('@')[0]}!\n` +
                `*├▢ COUNT : ${warningCount}*\n` +
                `*├▢ REASON : LINK SENDING*\n` +
                `*├▢ WARN LIMIT : 3*\n` +
                `*╰────────────────*`,
          mentions: [sender]
        });
      } else {
        // Remove user if they exceed warning limit
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *HAS BEEN REMOVED - WARN LIMIT EXCEEDED!*`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});


cmd({
    pattern: "antibug",
    desc: "Delete bug/crash messages and remove/block sender.",
    category: "tools",
    react: "🛡️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply, isBotAdmins }) => {
    try {
        const bugPatterns = /(‏‏|۝|)/g;

        // Check message text
        const text = m?.text || m?.conversation || "";
        if (!text) return reply(" AntiBug active. No bug detected yet.");

        // Detect bug
        if (text.length > 1500 || bugPatterns.test(text)) {
            await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });

            if (isGroup) {
                if (!isBotAdmins) return reply("❌ Hey I need admin rights to delete and remove.");
                
                // Delete message
                await conn.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: mek.key.id,
                        participant: sender
                    }
                });

                // Remove sender
                await conn.groupParticipantsUpdate(from, [sender], "remove");
                await conn.sendMessage(from, { text: `⚠️ ${sender} removed for sending bug message.` });

            } else {
                // Block in private chat
                await conn.updateBlockStatus(sender, "block");
                await conn.sendMessage(from, { text: `🚫 Blocked ${sender} for sending bug message.` });
            }
        } else {
            reply("AntiBug active. No threats found in this message.");
        }
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});
                    
    
