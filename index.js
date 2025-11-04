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
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const util = require('util');
const express = require('express');
const { File } = require('megajs');
const config = require('./config');
const { sms } = require('./lib/msg');
const {
  getBuffer,
  getGroupAdmins,
  h2k,
  isUrl,
  runtime,
  sleep,
  fetchJson
} = require('./lib/functions');

const ownerNumber = ['94772469026']; // 🧠 change to your owner number
const connectDB = require('./lib/mongodb');
connectDB();

const app = express();
const port = process.env.PORT || 8000;

// ✅ Download session from MEGA if not found
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (!config.SESSION_ID)
    return console.log('❌ Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID.replace('suho~', '');
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
      console.log('✅ Session downloaded from MEGA');
    });
  });
}

async function connectToWA() {
  console.log('🧩 Connecting WhatsApp bot...');

  const { readEnv } = require('./lib/database');
  const dbConfig = await readEnv();
  const prefix = dbConfig.PREFIX || '.';

  const { state, saveCreds } = await useMultiFileAuthState(
    __dirname + '/auth_info_baileys/'
  );
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Firefox'),
    syncFullHistory: true,
    auth: state,
    version
  });

  // 🧠 Connection handling
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason =
        lastDisconnect?.error?.output?.statusCode ||
        lastDisconnect?.error?.output?.payload?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('⚠️ Connection closed, reconnecting...');
        connectToWA();
      } else {
        console.log('🚫 Logged out from WhatsApp.');
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
      const path = require('path');

      fs.readdirSync('./plugins/').forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === '.js') {
          require('./plugins/' + plugin);
        }
      });
      console.log('📦 Plugins loaded successfully!');

      const up = `🔥 *AGNI Connected Successfully!*\nPowered By Shashika Dilshan\nPrefix: ${prefix}`;
      conn.sendMessage(ownerNumber[0] + '@s.whatsapp.net', {
        image: { url: 'https://files.catbox.moe/4kux2y.jpg' },
        caption: up
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // 🧠 Handle group events
  conn.ev.on('group-participants.update', async (update) => {
    try {
      const group = await conn.groupMetadata(update.id);
      const participant = update.participants[0];
      if (update.action === 'add') {
        await conn.sendMessage(update.id, {
          text: `👋 Welcome @${
            participant.split('@')[0]
          } to *${group.subject}*!`,
          mentions: [participant]
        });
      } else if (update.action === 'remove') {
        await conn.sendMessage(update.id, {
          text: `😢 @${
            participant.split('@')[0]
          } left *${group.subject}*!`,
          mentions: [participant]
        });
      }
    } catch (e) {
      console.log('⚠️ Group event error: ' + e);
    }
  });

  // 🧠 Message handling
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      mek = mek.messages[0];
      if (!mek.message) return;

      mek.message =
        getContentType(mek.message) === 'ephemeralMessage'
          ? mek.message.ephemeralMessage.message
          : mek.message;

      if (mek.key && mek.key.remoteJid === 'status@broadcast') return;

      const m = sms(conn, mek);
      const from = mek.key.remoteJid;
      const type = getContentType(mek.message);
      const body =
        type === 'conversation'
          ? mek.message.conversation
          : type === 'extendedTextMessage'
          ? mek.message.extendedTextMessage.text
          : type === 'imageMessage' && mek.message.imageMessage.caption
          ? mek.message.imageMessage.caption
          : type === 'videoMessage' && mek.message.videoMessage.caption
          ? mek.message.videoMessage.caption
          : '';

      const isCmd = body.startsWith(prefix);
      const command = isCmd
        ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase()
        : '';
      const args = body.trim().split(/ +/).slice(1);
      const q = args.join(' ');
      const isGroup = from.endsWith('@g.us');
      const sender = mek.key.fromMe
        ? conn.user.id
        : mek.key.participant || mek.key.remoteJid;
      const senderNumber = sender.split('@')[0];
      const isOwner =
        ownerNumber.includes(senderNumber) ||
        senderNumber === conn.user.id.split(':')[0];
      const groupMetadata = isGroup
        ? await conn.groupMetadata(from).catch((e) => {})
        : '';
      const groupAdmins = isGroup
        ? getGroupAdmins(groupMetadata.participants)
        : [];
      const isAdmins = groupAdmins.includes(sender);
      const reply = (text) =>
        conn.sendMessage(from, { text }, { quoted: mek });

      // 🧩 Dynamic command loading
      const events = require('./command');
      const cmd =
        events.commands.find((c) => c.pattern === command) ||
        events.commands.find(
          (c) => c.alias && c.alias.includes(command)
        );

      if (isCmd && cmd) {
        if (cmd.react)
          conn.sendMessage(from, {
            react: { text: cmd.react, key: mek.key }
          });

        try {
          await cmd.function(conn, mek, m, {
            from,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            isOwner,
            groupMetadata,
            groupAdmins,
            isAdmins,
            reply
          });
        } catch (e) {
          console.error('[PLUGIN ERROR]', e);
        }
      }
    } catch (err) {
      console.log('⚠️ Message handler error:', err);
    }
  });
}

// 🧠 Express server keep-alive
app.get('/', (req, res) => {
  res.send('✅ Bot is running successfully!');
});

app.listen(port, () =>
  console.log(`🌐 Server running on http://localhost:${port}`)
);

setTimeout(connectToWA, 3000);
