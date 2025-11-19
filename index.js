/**
 * merged index.js
 * - Combines the two code snippets you supplied
 * - Handles session download (MEGA), MongoDB env, plugins, anti features, auto-react/status, anti-delete
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const P = require('pino');
const qrcode = require('qrcode-terminal');
const util = require('util');
const axios = require('axios');
const { File } = require('megajs');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

const config = require('./config');

// helper functions
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { sms, downloadMediaMessage } = require('./lib/msg');

// data modules (two different modules in your snippets).
// rename conflicting imports to avoid collisions and try to use both if available
let SHASHIKA = {};
try { SHASHIKA = require('./lib/SHASHIKA-data'); } catch (e) { /* ignore if not present */ }

let DATA = {};
try { DATA = require('./data'); } catch (e) { /* ignore if not present */ }

// database helpers
const { readEnv, getAntiDeleteStatus } = require('./lib/database');

// choose which saveMessage / loadMessage to use (prefer SHASHIKA-data if exists)
const saveMessage = SHASHIKA.saveMessage || DATA.saveMessage || (async () => {});
const loadMessage = SHASHIKA.loadMessage || DATA.loadMessage || (id => null);

// AntiLink / AntiBadWords getters/setters (prefer SHASHIKA-data)
const setAntiLink = SHASHIKA.setAntiLink || (jid => false);
const getAntiLink = SHASHIKA.getAntiLink || (jid => false);
const setAntiBadWords = SHASHIKA.setAntiBadWords || (jid => false);
const getAntiBadWords = SHASHIKA.getAntiBadWords || (jid => false);

// other optional functions from DATA
const { initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings } = DATA || {};

// owner
const ownerNumber = ['94772469026'];

// ✅ Connect MongoDB before anything else
const connectDB = require('./lib/mongodb');
connectDB().catch(e => console.log('MongoDB connect error (ignored):', e));

// ================= SESSION-AUTH (MEGA session download if needed) =================
const AUTH_DIR = __dirname + '/auth_info_baileys/';
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const CRED_FILE = path.join(AUTH_DIR, 'creds.json');
if (!fs.existsSync(CRED_FILE)) {
  if (!config.SESSION_ID) {
    console.log('No local creds.json and SESSION_ID not provided. Please add SESSION_ID env if you want auto session download.');
  } else {
    try {
      // tolerate two possible prefixes used in your snippets
      let sessdata = config.SESSION_ID.replace('suho-', '').replace('suho~', '');
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
      filer.download((err, data) => {
        if (err) return console.log('Error downloading session from MEGA:', err);
        fs.writeFileSync(CRED_FILE, data);
        console.log('Session downloaded ✅');
      });
    } catch (e) {
      console.log('Failed to download session from MEGA:', e);
    }
  }
}

// ================= MAIN CONNECT FUNCTION =================
async function connectToWA() {
  try {
    // Load dynamic ENV variables from MongoDB
    const dbConfig = await readEnv().catch(() => ({}));
    config.PREFIX = (dbConfig && dbConfig.PREFIX) || config.PREFIX || '.';
    const prefix = config.PREFIX;

    console.log('Connecting wa bot 🔗...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Desktop'),
      auth: state,
      version,
      syncFullHistory: true,
      getMessage: async (key) => {
        // fallback to saved messages if needed
        try {
          const msg = loadMessage(key.id);
          if (msg) return msg.message || { conversation: '...' };
        } catch (e) { }
        return { conversation: 'hello' };
      }
    });

    // save creds
    conn.ev.on('creds.update', saveCreds);

    // connection updates
    conn.ev.on('connection.update', async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
          qrcode.generate(qr, { small: true });
          console.log('Scan the QR code to connect');
        }
        if (connection === 'close') {
          const reason = lastDisconnect?.error ? new DisconnectReason(lastDisconnect.error).output : null;
          console.log('Connection closed:', reason || lastDisconnect);
          // try reconnect on many reasons except logged out
          if (!reason || reason !== DisconnectReason.loggedOut) {
            console.log('Reconnecting...');
            setTimeout(connectToWA, 2000);
          } else {
            console.log('Logged out, please delete session and rescan qr');
          }
        } else if (connection === 'open') {
          console.log('Connected to WA ✅');
        }
      } catch (e) {
        console.log('connection.update handler error:', e);
      }
    });

    // on open: load plugins once
    conn.ev.on('connection.update', async (u) => {
      try {
        if (u.connection === 'open') {
          // load plugins folder (same approach as second snippet)
          fs.readdirSync("./plugins/").forEach((plugin) => {
            if (path.extname(plugin).toLowerCase() === ".js") {
              try {
                require("./plugins/" + plugin);
              } catch (e) {
                console.log('[PLUGIN LOAD ERROR]', plugin, e);
              }
            }
          });
          console.log('Plugins installed ✅');

          // notify owner
          const up = `AGNI connected successful ✅\nPowered by shashika dilshan\nPREFIX: ${prefix}`;
          try {
            await conn.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
              image: { url: 'https://files.catbox.moe/4kux2y.jpg' },
              caption: up
            });
          } catch (e) {
            // ignore if cannot send
          }
        }
      } catch (e) {
        console.log('post-open handler error:', e);
      }
    });

    // Group participants update passthrough if user has GroupEvents function
    try {
      const GroupEvents = require('./lib/groupEvents'); // optional file
      if (GroupEvents) conn.ev.on('group-participants.update', (update) => GroupEvents(conn, update));
    } catch (e) { /* ignore if not present */ }

    // single messages.upsert handler combining both snippets' logic
    conn.ev.on('messages.upsert', async (mekPayload) => {
      try {
        const mek = mekPayload.messages[0];
        if (!mek) return;
        if (!mek.message) return;

        // normalize ephemeral
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

        // ignore status broadcast messages for normal processing (but may mark read/react)
        const isStatus = mek.key && mek.key.remoteJid === 'status@broadcast';

        // auto-read / auto-status features from second snippet
        if (config.READ_MESSAGE === 'true') {
          try { await conn.readMessages([mek.key]); } catch (e) { }
        }

        if (isStatus && config.AUTO_STATUS_SEEN === "true") {
          try { await conn.readMessages([mek.key]); } catch (e) { }
        }

        // auto-react to status if enabled
        if (isStatus && config.AUTO_STATUS_REACT === "true") {
          try {
            const malvinlike = jidNormalizedUser(conn.user.id);
            const emojis = ['❤️','💸','😇','🍂','💥','💯','🔥','💫','💎','💗','🤍','🖤'];
            const randomEmoji = emojis[Math.floor(Math.random()*emojis.length)];
            await conn.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } }, { statusJidList: [mek.key.participant, malvinlike] });
          } catch (e) {}
        }

        // auto-reply to status if enabled
        if (isStatus && config.AUTO_STATUS_REPLY === "true") {
          try {
            const user = mek.key.participant;
            const text = `${config.AUTO_STATUS_MSG || 'Hi'}`;
            await conn.sendMessage(user, { text, react: { text: '💜', key: mek.key } }, { quoted: mek });
          } catch (e) {}
        }

        // normalize message body similarly to both snippets
        const from = mek.key.remoteJid;
        const type = Object.keys(mek.message)[0];
        const body = (type === 'conversation' && mek.message.conversation) ? mek.message.conversation
          : (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption
          : (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption
          : (type === 'extendedTextMessage' && mek.message.extendedTextMessage.text) ? mek.message.extendedTextMessage.text
          : '';

        // command parsing
        const isCmd = body && body.startsWith(prefix || config.PREFIX || '.');
        const command = isCmd ? body.slice((prefix || config.PREFIX || '.').length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const isGroup = from && from.endsWith('@g.us');
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const pushname = mek.pushName || 'No Name';
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = ownerNumber.includes(senderNumber);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(() => ({})) : null;
        const groupName = isGroup ? (groupMetadata.subject || '') : '';
        const participants = isGroup ? (groupMetadata.participants || []) : [];
        const groupAdmins = isGroup ? getGroupAdmins(participants) : [];
        const isBotGroupAdmins = isGroup ? groupAdmins.includes(botJid) : false;
        const isGroupAdmins = isGroup ? groupAdmins.includes(sender) : false;

        // Auto React (public) - from second snippet
        const m = sms(conn, mek); // wrapper message helper from ./lib/msg
        const isReact = m.message && m.message.reactionMessage ? true : false;
        if (!isReact && config.AUTO_REACT === 'true') {
          try {
            const reactions = ['🌼','❤️','💐','🔥','🏵️','❄️','🧊','🐳','💥','🥀','❤‍🔥','🥹','😩'];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            m.react(randomReaction);
          } catch (e) {}
        }

        // ======================= ANTI-LINK FEATURE =================================
        try {
          if (isGroup && getAntiLink(from) && !isGroupAdmins) {
            const isLink = isUrl(body);
            if (isLink) {
              await conn.sendMessage(from, { text: `*⚠️ ලින්ක් තහනම් ක්‍රියාත්මකයි!* \n@${senderNumber}, ඔබට මෙහි links යැවීමට අවසර නැත. ඔබව group එකෙන් ඉවත් කරනු ලැබේ.`, mentions: [sender] });
              if (isBotGroupAdmins) {
                await conn.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
              } else {
                await conn.sendMessage(from, { text: `*⚠️ Anti Link:* මට admin බලතල නැති නිසා @${senderNumber} ඉවත් කිරීමට නොහැක.`, mentions: [sender] });
              }
              // do not process further
              await saveMessage(mek).catch(()=>{});
              return;
            }
          }
        } catch (e) { /* ignore anti-link errors */ }

        // ======================= ANTI-BAD-WORDS FEATURE =================================
        try {
          if (isGroup && getAntiBadWords(from) && !isGroupAdmins) {
            const badWords = ['fuck','shit','piss','asshole','bitch','motherfucker','cunt','dick','pussy','මගුල','හුත්ත','පක','වේසි','ගොන්','බල්ලා','කැරි','හුකන'];
            const messageText = body.toLowerCase();
            const foundBadWord = badWords.some(word => messageText.includes(word));
            if (foundBadWord) {
              await conn.sendMessage(from, { text: `*🚫 අසභ්‍ය වචන තහනම් ක්‍රියාත්මකයි!* \n@${senderNumber}, අසභ්‍ය වචන භාවිතයෙන් වළකින්න.`, mentions: [sender] });
              if (isBotGroupAdmins) {
                await conn.sendMessage(from, { delete: mek.key }).catch(() => {});
              }
              await saveMessage(mek).catch(()=>{});
              return;
            }
          }
        } catch (e) { /* ignore bad-words errors */ }

        // ======================= PLUGIN HANDLER (both snippets used plugins) =======================
        try {
          // old style: require('./plugins') returning array
          let plugins = [];
          try {
            const p = require('./plugins');
            if (Array.isArray(p)) plugins = p;
            else if (p && typeof p === 'object' && p.default && Array.isArray(p.default)) plugins = p.default;
          } catch (e) { /* ignore */ }

          plugins.forEach(plugin => {
            try {
              if (plugin.cmd && plugin.cmd.includes(command)) {
                if (plugin.handle) {
                  plugin.handle({ conn, m: mek, mek, from, isCmd, command, args, isGroup, sender, pushname, botNumber, isOwner, groupMetadata, groupName, groupAdmins, isBotGroupAdmins, isGroupAdmins, config, util, sms, downloadMediaMessage, axios, File, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson });
                }
              }
            } catch (e) {
              console.log('[PLUGIN RUN ERROR]', e);
            }
          });

          // newer pattern: events.commands used in second snippet
          try {
            const events = require('./command');
            const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false;
            if (isCmd && cmdName) {
              const cmd = events.commands.find((c) => c.pattern === cmdName) || events.commands.find((c) => c.alias && c.alias.includes(cmdName));
              if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
                try {
                  cmd.function(conn, mek, m, { from, quoted: null, body, isCmd, command, args, q: args.join(' '), isGroup, sender, senderNumber, botJid, botNumber, pushname, isMe: false, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotGroupAdmins, isGroupAdmins, reply: (t)=>conn.sendMessage(from,{text:t},{quoted:mek}) });
                } catch (e) {
                  console.error("[PLUGIN ERROR] " + e);
                }
              }
            }
          } catch (e) { /* ignore missing command module */ }

        } catch (e) {
          console.log('plugin handler error', e);
        }

        // ✅ Save message for anti-delete and other features
        try { await saveMessage(mek).catch(()=>{}); } catch (e) {}

      } catch (err) {
        console.log('messages.upsert catch:', err);
      }
    });

    // ======================= ANTI DELETE listener =======================
    conn.ev.on('messages.delete', async (del) => {
      try {
        if (!del || !del.key) return;
        if (del.key.remoteJid === 'status@broadcast') return;

        // check Anti-Delete status from DB
        const isAntiDeleteEnabled = await (getAntiDeleteStatus ? getAntiDeleteStatus() : true).catch(() => true);
        if (!isAntiDeleteEnabled) return;

        const from = del.key.remoteJid;
        const msgId = del.key.id;
        const msg = loadMessage ? loadMessage(msgId) : null;
        if (!msg) return;

        const sender = msg.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (msg.key.participant || msg.key.remoteJid);
        const body = (msg.message?.conversation) ? msg.message.conversation : (msg.message?.extendedTextMessage) ? msg.message.extendedTextMessage.text : 'Media/Other Message Type';
        const isGroup = from.endsWith('@g.us');
        let groupMetadata = null;
        if (isGroup) groupMetadata = await conn.groupMetadata(from).catch(() => null);

        // check group admin — don't report if sender is group admin
        let senderIsGroupAdmin = false;
        if (isGroup && groupMetadata) {
          const admins = getGroupAdmins(groupMetadata.participants);
          senderIsGroupAdmin = admins.includes(sender);
        }
        if (senderIsGroupAdmin) return;

        const teks = `
*--- ❌ පණිවිඩයක් මකා දමා ඇත (Anti Delete) ❌ ---*
*යවන්නා (Sender):* @${sender.split('@')[0]}
*චැට් එක (Chat):* ${isGroup ? (groupMetadata?.subject || 'Group') : 'පුද්ගලික චැට් (Private Chat)'}
*මකා දැමූ පණිවිඩය (Deleted Message):*
\`\`\`
${body}
\`\`\`
`;
        await conn.sendMessage(from, { text: teks, mentions: [sender] }).catch(() => {});
      } catch (e) {
        console.log('messages.delete handler error', e);
      }
    });

    // leave room for other events from your second snippet
    // e.g., extra messages.upsert code already merged

    // ======================= Web server for keep-alive =======================
    app.get('/', (req, res) => res.send('Bot is running!'));
    app.listen(port, () => console.log(`Server listening on port ${port}`));

  } catch (e) {
    console.log('connectToWA error:', e);
    // retry in a bit
    setTimeout(connectToWA, 5000);
  }
}

connectToWA();
