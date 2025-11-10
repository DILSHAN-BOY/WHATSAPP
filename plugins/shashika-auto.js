//𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧//
const fs = require('fs');
const path = require('path');
const { readEnv } = require('../lib/database');
const { cmd } = require('../command');

// auto_voice
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const config = await readEnv(); // DB එකෙන් load කරනවා
    const filePath = path.join(__dirname, '../sd-data/auto-voice.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_VOICE === 'true') {
                await conn.sendPresenceUpdate('recording', from);
                await conn.sendMessage(from, { audio: { url: data[text] }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
            }
        }
    }
});

// auto_sticker
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const config = await readEnv();
    const filePath = path.join(__dirname, '../sd-data/auto-stickers.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_STICKER === 'true') {
                await conn.sendMessage(from, { sticker: { url: data[text] }, package: 'Malvin King' }, { quoted: mek });
            }
        }
    }
});

// auto_reply
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const config = await readEnv();
    const filePath = path.join(__dirname, '../sd-data/auto-reply.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_REPLY === 'true') {
                await m.reply(data[text]);
            }
        }
    }
});

// fake_recording
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const config = await readEnv();
    if (config.FAKE_RECORDING === 'true') {
        await conn.sendPresenceUpdate('recording', from);
    }
});

// Composing (Auto Typing)
lite({
    on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    const config = await readEnv();
    if (config.AUTO_TYPING === 'true') {
        await conn.sendPresenceUpdate('composing', from); // send typing 
    }
});
