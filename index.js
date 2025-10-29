// ======================= FULL FIXED INDEX.JS =======================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const configFile = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const axios = require('axios');
const { File } = require('megajs');
const { sms, downloadMediaMessage } = require('./lib/msg');
const { getBuffer, getGroupAdmins } = require('./lib/functions');

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94772469026'];

// ==================== SESSION-AUTH ====================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if(!configFile.SESSION_ID) return console.log('Please add your SESSION_ID in config!');
    const sessdata = configFile.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if(err) throw err;
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("╰┈➤ ❝ [15%] ❞ Session downloaded ✅");
        });
    });
}

// ==================== CONNECT FUNCTION ====================
async function connectToWA() {
    // MongoDB connect
    const connectDB = require('./lib/mongodb');
    connectDB();

    const { readEnv } = require('./lib/database');
    const config = await readEnv();
    const prifix = config.PRIFIX || prefix;

    console.log("Connecting 𝐀𝐆𝐍𝐈🧬...");

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    // ===== CONNECTION UPDATE =====
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut){
                connectToWA();
            }
        } else if(connection === 'open') {
            console.log('Bot connected ✅, loading plugins...');
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if(path.extname(plugin).toLowerCase() === ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('All plugins installed successfully ✅');
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // ===== MESSAGES HANDLER =====
    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if(!mek.message) return;

        mek.message = getContentType(mek.message) === 'ephemeralMessage' 
            ? mek.message.ephemeralMessage.message 
            : mek.message;

        if(mek.key.remoteJid === 'status@broadcast') return;

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const body = type === 'conversation' ? mek.message.conversation
            : type === 'extendedTextMessage' ? mek.message.extendedTextMessage.text
            : type === 'imageMessage' && mek.message.imageMessage.caption ? mek.message.imageMessage.caption
            : type === 'videoMessage' && mek.message.videoMessage.caption ? mek.message.videoMessage.caption
            : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const from = mek.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe ? conn.user.id.split(':')[0]+'@s.whatsapp.net' : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const pushname = mek.pushName || 'Sin Nombre';
        const isOwner = ownerNumber.includes(senderNumber);

        const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek });

        // ===== AUTO REACT =====
        const isReact = m.message?.reactionMessage ? true : false;
        if (!isReact && config.AUTO_REACT === 'true') {
            const reactions = ['🌼','❤️','🔥','🥹','😻','🙌','💐','🪴'];
            const randomReaction = reactions[Math.floor(Math.random()*reactions.length)];
            m.react(randomReaction);
        }

        // ===== OWNER CUSTOM REACT =====
        if(senderNumber.includes("94772469026") && !isReact) m.react("😊");

        // ===== COMMAND HANDLER =====
        if(isCmd){
            const events = require('./command');
            const cmdObj = events.commands.find(c => c.pattern === command) || events.commands.find(c => c.alias?.includes(command));
            if(cmdObj){
                if(cmdObj.react) conn.sendMessage(from, { react: { text: cmdObj.react, key: mek.key }});
                try{
                    cmdObj.function(conn, mek, m, { from, quoted: mek, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isOwner, reply });
                } catch(e){
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
    });
}

// ===== EXPRESS SERVER =====
app.get("/", (req, res) => res.send("Bot started ✅"));
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// ===== START BOT =====
setTimeout(() => connectToWA(), 4000);
