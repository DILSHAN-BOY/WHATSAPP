// =================== IMPORTS ===================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const axios = require("axios");
const { File } = require("megajs");
const express = require("express");
const path = require("path");
const config = require("./config");

const {
  getBuffer,
  getGroupAdmins,
  sms,
} = require("./lib/functions");

const connectDB = require("./lib/mongodb");
connectDB();

const ownerNumber = config.OWNER_NUM;
const app = express();
const port = process.env.PORT || 8000;

// =================== SESSION AUTH ===================
if (!fs.existsSync(__dirname + "/auth_info_baileys/creds.json")) {
  if (!config.SESSION_ID) {
    console.log("Please add your session to SESSION_ID env !!");
    process.exit(1);
  }

  const sessdata = config.SESSION_ID.replace("suho~", "");
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFile(__dirname + "/auth_info_baileys/creds.json", data, () => {
      console.log("Session downloaded ✅");
    });
  });
}

// =================== CONNECT TO WA ===================
async function connectToWA() {
  console.log("Connecting bot...");

  const { readEnv } = require("./lib/database");
  const dbConfig = await readEnv();
  const prefix = dbConfig.PREFIX || ".";

  const { state, saveCreds } = await useMultiFileAuthState(
    __dirname + "/auth_info_baileys/"
  );

  const { version } = await fetchLatestBaileysVersion();

  const malvin = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
  });

  // =================== CONNECTION UPDATE ===================
  malvin.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      if (
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
      ) {
        connectToWA();
      }
    } else if (connection === "open") {
      console.log("Connected to WhatsApp ✅");
      console.log("Loading plugins...");

      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require("./plugins/" + plugin);
        }
      });

      console.log("Plugins loaded ✅");

      const up = `Connected successfully ✅`;
      const up1 = `🪀 Bot is running!`;

      // Send startup message
      malvin.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: { url: "https://files.catbox.moe/4kux2y.jpg" },
        caption: up,
      });

      malvin.sendMessage("94705104830@s.whatsapp.net", {
        image: { url: "https://files.catbox.moe/4kux2y.jpg" },
        caption: up1,
      });
    }
  });

  // =================== SAVE CREDS ===================
  malvin.ev.on("creds.update", saveCreds);

  // =================== MESSAGES ===================
  malvin.ev.on("messages.upsert", async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;

    mek.message =
      getContentType(mek.message) === "ephemeralMessage"
        ? mek.message.ephemeralMessage.message
        : mek.message;

    // AUTO READ STATUS & REACT
    if (
      mek.key &&
      mek.key.remoteJid === "status@broadcast" &&
      config.AUTO_READ_STATUS === "true"
    ) {
      try {
        await malvin.readMessages([mek.key]);
        const myJid = await jidNormalizedUser(malvin.user.id);
        const reactEmoji = "💚";
        await malvin.sendMessage(
          mek.key.remoteJid,
          { react: { key: mek.key, text: reactEmoji } },
          { statusJidList: [mek.key.participant, myJid] }
        );
      } catch (err) {
        console.error("Failed to mark status as read:", err);
      }
    }

    // AUTO RECORDING PRESENCE
    if (config.AUTO_RECORDING) {
      const jid = mek.key.remoteJid;
      await malvin.sendPresenceUpdate("recording", jid);
      await new Promise((res) => setTimeout(res, 1000));
    }

    const body =
      getContentType(mek.message) === "conversation"
        ? mek.message.conversation
        : getContentType(mek.message) === "extendedTextMessage"
        ? mek.message.extendedTextMessage.text
        : getContentType(mek.message) === "imageMessage" &&
          mek.message.imageMessage.caption
        ? mek.message.imageMessage.caption
        : getContentType(mek.message) === "videoMessage" &&
          mek.message.videoMessage.caption
        ? mek.message.videoMessage.caption
        : "";

    const isCmd = body.startsWith(prefix);
    const from = mek.key.remoteJid;
    const sender = mek.key.fromMe
      ? malvin.user.id.split(":")[0] + "@s.whatsapp.net"
      : mek.key.participant || from;

    const reply = (text) => {
      malvin.sendMessage(from, { text }, { quoted: mek });
    };

    // =================== WORK TYPE ===================
    if (!ownerNumber.includes(sender) && config.MODE === "private") return;
    if (!ownerNumber.includes(sender) && mek.key.remoteJid.endsWith("@g.us") && config.MODE === "inbox") return;
    if (!ownerNumber.includes(sender) && !mek.key.remoteJid.endsWith("@g.us") && config.MODE === "groups") return;

    // =================== COMMAND HANDLER ===================
    const events = require("./command");
    const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false;

    if (isCmd) {
      const cmd =
        events.commands.find((c) => c.pattern === cmdName) ||
        events.commands.find((c) => c.alias && c.alias.includes(cmdName));
      if (cmd) {
        if (cmd.react)
          malvin.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

        try {
          cmd.function(malvin, mek, null, {
            from,
            quoted: mek,
            body,
            isCmd,
            command: cmdName,
            reply,
          });
        } catch (e) {
          console.error("[PLUGIN ERROR] " + e);
        }
      }
    }
  });

  // =================== ANTI DELETE ===================
  malvin.ev.on("messages.delete", async (item) => {
    try {
      const message = item.messages[0];
      if (!message.message || message.key.fromMe) return;

      const from = message.key.remoteJid;
      const sender = message.key.participant || from;
      const contentType = getContentType(message.message);
      const deletedMsg = message.message[contentType];

      let text = "";
      if (contentType === "conversation") text = deletedMsg;
      else if (contentType === "extendedTextMessage")
        text = deletedMsg.text || deletedMsg;
      else return;

      await malvin.sendMessage(from, {
        text: `🛡️ *Anti-Delete*\n👤 *User:* @${sender.split("@")[0]}\n💬 *Deleted Message:* ${text}`,
        mentions: [sender],
      });
    } catch (err) {
      console.error("Anti-delete error:", err);
    }
  });
}

// =================== EXPRESS SERVER ===================
app.get("/", (req, res) => {
  res.send("hey, started✅");
});

app.listen(port, () =>
  console.log(`Server listening on port http://localhost:${port}`)
);

// =================== START BOT ===================
setTimeout(() => {
  connectToWA();
}, 4000);
