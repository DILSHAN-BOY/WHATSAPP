const { loadMessage } = require("../lib/SHASHIKA-data");
const { getContentType } = require("@whiskeysockets/baileys");

module.exports = {
    async onMessageDeleted(conn, msg) {
        try {
            const jid = msg.key.remoteJid;

            // GROUP + PM දෙකේම catch කරන්න, filter එක skip කරන්න
            if (msg.key.fromMe) return;

            const deleted = await loadMessage(msg.key.id);
            if (!deleted) return;

            const type = getContentType(deleted.message);

            // Set captions per type
            let caption = "";
            switch(type) {
                case "conversation":
                case "extendedTextMessage":
                    caption = "🗑️ Text Deleted!";
                    break;
                case "imageMessage":
                    caption = "🗑️ Photo Deleted!";
                    break;
                case "videoMessage":
                    caption = "🗑️ Video Deleted!";
                    break;
                case "stickerMessage":
                    caption = "🗑️ Sticker Deleted!";
                    break;
                case "documentMessage":
                    caption = "🗑️ Document Deleted!";
                    break;
                case "audioMessage":
                case "voiceMessage":
                    caption = "🗑️ Voice Deleted!";
                    break;
                default:
                    caption = "🗑️ Message Deleted!";
            }

            // Forward original message
            await conn.sendMessage(jid, { forward: deleted }, { quoted: deleted });

            // Send caption
            await conn.sendMessage(jid, { text: caption });

        } catch (e) {
            console.log("AntiDelete Error:", e);
        }
    }
};
