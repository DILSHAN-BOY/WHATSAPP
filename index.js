// index.js (merged & fixed)
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const P = require('pino')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const util = require('util')
const axios = require('axios')
const { File } = require('megajs')
const express = require('express')
const app = express()
const port = process.env.PORT || 8000

const l = console.log

// local helpers / data (adjust paths if your repo differs)
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { saveMessage, loadMessage, setAntiLink, getAntiLink, setAntiBadWords, getAntiBadWords } = require('./lib/SHASHIKA-data')
const { getAntiDeleteStatus } = require('./lib/database')
const { sms, downloadMediaMessage } = require('./lib/msg') // adjust if path is ./lib/msg or ./lib/index
const connectDB = require('./lib/mongodb')

// config + owner
const config = require('./config')
const ownerNumber = ['94772469026']

// connect DB first
connectDB().catch(e => console.log('Mongo connect err:', e))

// session restore from MEGA if needed
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (!config.SESSION_ID) {
    console.log('Please add your session to SESSION_ID env !!')
  } else {
    try {
      const sessdata = config.SESSION_ID.replace("suho~", '')
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
      filer.download((err, data) => {
        if (err) return console.error('Session download error:', err)
        fs.mkdirSync(__dirname + '/auth_info_baileys/', { recursive: true })
        fs.writeFileSync(__dirname + '/auth_info_baileys/creds.json', data)
        console.log('Session downloaded ✅')
      })
    } catch (e) {
      console.error('Failed to download session:', e)
    }
  }
}

async function connectToWA() {
  try {
    // load dynamic env from DB (PREFIX, etc.)
    const { readEnv } = require('./lib/database')
    const dbConfig = await readEnv().catch(() => ({}))
    const prefix = (dbConfig && dbConfig.PREFIX) ? dbConfig.PREFIX : (config.PREFIX || '.')

    console.log('Connecting wa bot 🧬...')
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Firefox'),
      syncFullHistory: true,
      auth: state,
      version
    })

    // save credentials
    conn.ev.on('creds.update', saveCreds)

    // connection updates
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update
      if (connection === 'close') {
        const err = lastDisconnect?.error
        const status = err ? (err.output?.statusCode || null) : null
        if (status !== DisconnectReason?.loggedOut) {
          console.log('Connection closed unexpectedly — reconnecting...')
          setTimeout(connectToWA, 2000)
        } else {
          console.log('Logged out. Please remove session files and re-scan QR.')
        }
      } else if (connection === 'open') {
        console.log('Bot connected to WhatsApp ✅')

        // load plugins (if your plugins export functions)
        try {
          const path = require('path')
          fs.readdirSync("./plugins/").forEach((pluginFile) => {
            if (path.extname(pluginFile).toLowerCase() === ".js") {
              try { require("./plugins/" + pluginFile) } catch (e) { console.error('Plugin load error', pluginFile, e) }
            }
          })
          console.log('Plugins installed successful ✅')
        } catch (e) {
          console.error('Plugin loader error:', e)
        }

        // notify owner(s)
        try {
          const up = `𝐀𝐆𝐍𝐈 connected successful ✅\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧\nPREFIX: ${prefix}`
          const ownerJid = ownerNumber.map(n => n + '@s.whatsapp.net')
          // send to first owner only (avoid array issue)
          if (ownerJid[0]) {
            await conn.sendMessage(ownerJid[0], { image: { url: `https://files.catbox.moe/4kux2y.jpg` }, caption: up })
          }
        } catch (e) {
          console.error('Notify owner error:', e)
        }
      }

      if (qr) {
        qrcode.generate(qr, { small: true })
        console.log('Scan the QR code to connect')
      }
    })

    // group participant updates (placeholder — keep your actual logic)
    conn.ev.on("group-participants.update", (update) => {
      try {
        const GroupEvents = require('./lib/group-events') // or your file
        if (typeof GroupEvents === 'function') GroupEvents(conn, update)
      } catch (e) {
        // ignore if not present
      }
    })

    // single, merged messages.upsert handler (all features)
    conn.ev.on('messages.upsert', async (up) => {
      try {
        let mek = up.messages && up.messages[0]
        if (!mek) return
        if (!mek.message) return

        // Unwrap ephemeral messages
        if (getContentType(mek.message) === 'ephemeralMessage' && mek.message.ephemeralMessage) {
          mek.message = mek.message.ephemeralMessage.message
        }

        // ignore status broadcasts optionally (we handle status specially below)
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
          // Auto status features
          if (config.AUTO_STATUS_SEEN === "true") {
            await conn.readMessages([mek.key]).catch(()=>{})
            console.log(`Auto-read status from ${mek.key.participant}`)
          }

          if (config.AUTO_STATUS_REACT === "true") {
            const malvinlike = await jidNormalizedUser(conn.user.id)
            const emojis = ['❤️','💸','😇','🍂','💥','💯','🔥','💫','💎','💗','🤍','🖤']
            const randomEmoji = emojis[Math.floor(Math.random()*emojis.length)]
            await conn.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } }, { statusJidList: [mek.key.participant, malvinlike] }).catch(()=>{})
          }

          if (config.AUTO_STATUS_REPLY === "true") {
            const user = mek.key.participant
            const text = `${config.AUTO_STATUS_MSG || 'Thanks for the update!'}`
            await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek }).catch(()=>{})
          }

          // don't continue to normal processing for status messages
          return
        }

        // mark read if configured
        if (config.READ_MESSAGE === 'true') {
          await conn.readMessages([mek.key]).catch(()=>{})
        }

        // skip Baileys internal messages
        if (mek.key.id && mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

        // Prepare helpers/flags
        const m = sms(conn, mek) // your sms wrapper
        const type = getContentType(mek.message)
        const from = mek.key.remoteJid
        const isGroup = from && from.endsWith && from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
        const pushname = mek.pushName || 'No Name'
        const body = (type === 'conversation') ? mek.message.conversation
          : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage?.text
          : (type === 'imageMessage') ? mek.message.imageMessage?.caption
          : (type === 'videoMessage') ? mek.message.videoMessage?.caption
          : ''

        const isCmd = typeof body === 'string' && body.startsWith(prefix || config.PREFIX || '.')
        const command = isCmd ? body.slice((prefix||config.PREFIX||'.').length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const botNumberShort = conn.user.id.split(':')[0]
        const isOwner = ownerNumber.includes(senderNumber) || botNumberShort.includes(senderNumber)

        // group metadata safe load
        let groupMetadata = null
        let groupName = ''
        let participants = []
        let groupAdmins = []
        try {
          if (isGroup) {
            groupMetadata = await conn.groupMetadata(from).catch(()=>null)
            groupName = groupMetadata?.subject || ''
            participants = groupMetadata?.participants || []
            groupAdmins = getGroupAdmins(participants)
          }
        } catch (e) { /* ignore */ }

        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
        const isReact = m?.message?.reactionMessage ? true : false

        // quick reply helper
        const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek }).catch(()=>{})

        // Auto-react (public)
        if (!isReact && config.AUTO_REACT === 'true') {
          const reactions = ['🌼','❤️','💐','🔥','🏵️','❄️','🧊','🐳','💥','🥀','❤‍🔥','🥹','😩','🫣','🤭','👻','👾','🫶','😻']
          const randomReaction = reactions[Math.floor(Math.random()*reactions.length)]
          try { await conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } }) } catch (e) {}
        }

        // MODE gates (private/inbox/groups)
        if (!isOwner && config.MODE === "private") return
        if (!isOwner && isGroup && config.MODE === "inbox") return
        if (!isOwner && !isGroup && config.MODE === "groups") return

        // ================= ANTI-LINK =================
        if (isGroup && getAntiLink(from) && !isAdmins) {
          const containsLink = isUrl(body || '')
          if (containsLink) {
            await conn.sendMessage(from, { text: `*⚠️ ලින්ක් තහනම් ක්‍රියාත්මකයි!* \n@${senderNumber}, ඔබට මෙහි links යැවීමට අවසර නැත.`, mentions: [sender] }).catch(()=>{})
            if (isBotAdmins) {
              await conn.groupParticipantsUpdate(from, [sender], 'remove').catch(()=>{})
            } else {
              await conn.sendMessage(from, { text: `*⚠️ Anti Link:* මට admin බලතල නැති නිසා @${senderNumber} ඉවත් කිරීමට නොහැක.`, mentions: [sender] }).catch(()=>{})
            }
            return
          }
        }

        // ================= ANTI-BAD-WORDS =================
        if (isGroup && getAntiBadWords(from) && !isAdmins) {
          const badWords = ['fuck','shit','piss','asshole','bitch','motherfucker','cunt','dick','pussy','මගුල','හුත්ත','පක','වේසි','ගොන්','බල්ලා','කැරි','හුකන']
          const messageText = (body || '').toLowerCase()
          const found = badWords.some(w => messageText.includes(w))
          if (found) {
            await conn.sendMessage(from, { text: `*🚫 අසභ්‍ය වචන තහනම් ක්‍රියාත්මකයි!* \n@${senderNumber}, අසභ්‍ය වචන භාවිතයෙන් වළකින්න.`, mentions: [sender] }).catch(()=>{})
            if (isBotAdmins) {
              // try to delete the message
              await conn.sendMessage(from, { delete: mek.key }).catch(()=>{})
            }
            return
          }
        }

        // ================= COMMAND HANDLER =================
        try {
          const events = require('./command')
          const cmdName = isCmd ? body.slice((prefix||config.PREFIX||'.').length).trim().split(" ")[0].toLowerCase() : false
          if (isCmd && events && events.commands) {
            const cmd = events.commands.find(c => c.pattern === cmdName) || events.commands.find(c => c.alias && c.alias.includes(cmdName))
            if (cmd) {
              if (cmd.react) {
                conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } }).catch(()=>{})
              }
              try {
                cmd.function(conn, mek, m, { from, quoted: mek.message.extendedTextMessage?.contextInfo?.quotedMessage, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
              } catch (e) {
                console.error('[PLUGIN ERROR]', e)
              }
            }
          }

          // body / text / image / sticker event mapping
          if (events && events.commands && Array.isArray(events.commands)) {
            events.commands.map(async (command) => {
              try {
                if (body && command.on === "body") {
                  command.function(conn, mek, m, { from, l, quoted: mek.message.extendedTextMessage?.contextInfo?.quotedMessage, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
                } else if (mek.message && command.on === "text" && (type === 'conversation' || type === 'extendedTextMessage')) {
                  command.function(conn, mek, m, { from, l, quoted: mek.message.extendedTextMessage?.contextInfo?.quotedMessage, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
                } else if ((command.on === "image" || command.on === "photo") && type === "imageMessage") {
                  command.function(conn, mek, m, { from, l, quoted: mek.message.extendedTextMessage?.contextInfo?.quotedMessage, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
                } else if (command.on === "sticker" && type === "stickerMessage") {
                  command.function(conn, mek, m, { from, l, quoted: mek.message.extendedTextMessage?.contextInfo?.quotedMessage, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, pushname, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
                }
              } catch (e) {
                // plugin errors won't break loop
              }
            })
          }
        } catch (e) {
          // ignore command loader errors
        }

        // Save message for anti-delete
        try { await saveMessage(mek).catch(()=>{}) } catch (e) {}

      } catch (e) {
        console.error('messages.upsert error:', e)
      }
    })

    // anti-delete listener
    conn.ev.on('messages.delete', async (del) => {
      try {
        if (!del || !del.key) return
        if (del.key.remoteJid === 'status@broadcast') return

        const isAntiDeleteEnabled = await getAntiDeleteStatus().catch(()=>false)
        if (!isAntiDeleteEnabled) return

        const from = del.key.remoteJid
        const saved = await loadMessage(del.key.id) // your loader should return the saved message object
        if (!saved) return

        const sender = saved.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (saved.key.participant || saved.key.remoteJid)
        const body = (saved.message?.conversation) ? saved.message.conversation : (saved.message?.extendedTextMessage) ? saved.message.extendedTextMessage.text : 'Media/Other Message Type'
        const isGroup = from.endsWith('@g.us')
        let groupMetadata = null
        if (isGroup) groupMetadata = await conn.groupMetadata(from).catch(()=>null)

        // check if sender is group admin — if so, ignore
        if (isGroup) {
          const groupAdmins = getGroupAdmins(groupMetadata?.participants || [])
          if (groupAdmins.includes(sender)) return
        }

        const teks = `
*--- ❌ පණිවිඩයක් මකා දමා ඇත (Anti Delete) ❌ ---*
*යවන්නා (Sender):* @${sender.split('@')[0]}
*චැට් එක (Chat):* ${isGroup ? (groupMetadata?.subject || 'Group') : 'Private Chat'}
*මකා දැමූ පණිවිඩය (Deleted Message):*
\`\`\`
${body}
\`\`\`
`
        conn.sendMessage(from, { text: teks, mentions: [sender] }).catch(()=>{})

      } catch (e) {
        console.error('messages.delete handler error:', e)
      }
    })

    // basic keepalive web server
    app.get('/', (req, res) => res.send('Bot is running!'))
    app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`))

  } catch (e) {
    console.error('connectToWA error:', e)
    setTimeout(connectToWA, 5000)
  }
}

connectToWA()
