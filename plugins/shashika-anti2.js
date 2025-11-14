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
//==================================================


const { getContentType } = require('@whiskeysockets/baileys');
const { getBuffer } = require('../lib/functions'); // ඔයාට already getBuffer function තියෙනවා

module.exports = {
    async onViewOnce(conn, mek) {
        try {
            if (!mek.message) return;
            
            // Check if it's a viewOnceMessage
            if (!mek.message.viewOnceMessageV2) return;

            // Extract the actual message inside viewOnceMessage
            let content = mek.message.viewOnceMessageV2.message;
            let type = getContentType(content);

            let buffer = null;
            let messageOptions = { caption: content[type].caption || '' };

            if (type === 'imageMessage') {
                buffer = await getBuffer(content.imageMessage);
                await conn.sendMessage(mek.key.remoteJid, { image: buffer, ...messageOptions }, { quoted: mek });
            } else if (type === 'videoMessage') {
                buffer = await getBuffer(content.videoMessage);
                await conn.sendMessage(mek.key.remoteJid, { video: buffer, ...messageOptions, mimetype: 'video/mp4' }, { quoted: mek });
            } else if (type === 'documentMessage') {
                buffer = await getBuffer(content.documentMessage);
                await conn.sendMessage(mek.key.remoteJid, { document: buffer, mimetype: content.documentMessage.mimetype, ...messageOptions }, { quoted: mek });
            } else if (type === 'audioMessage' || type === 'voiceMessage') {
                buffer = await getBuffer(content.audioMessage || content.voiceMessage);
                await conn.sendMessage(mek.key.remoteJid, { audio: buffer, mimetype: 'audio/mpeg', ...messageOptions }, { quoted: mek });
            } else {
                await conn.sendMessage(mek.key.remoteJid, { text: 'Unsupported view once type!' }, { quoted: mek });
            }

        } catch (e) {
            console.log('ViewOnce Plugin Error:', e);
        }
    }
};
