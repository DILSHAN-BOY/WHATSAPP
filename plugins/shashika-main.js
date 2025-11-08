const { cmd } = require('../command');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const { readEnv } = require('../lib/database');
const { runtime } = require('../lib/functions');
const moment = require('moment-timezone');
const pkg = require("../package.json");

// ================= Helper Functions =================
function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heap: (used.heapUsed / 1024 / 1024).toFixed(2),
    rss: (used.rss / 1024 / 1024).toFixed(2),
    total: (os.totalmem() / 1024 / 1024).toFixed(0),
    free: (os.freemem() / 1024 / 1024).toFixed(2)
  };
}

function getTotalUsers() {
  try {
    return global.db && global.db.users
      ? Object.keys(global.db.users).length
      : 0;
  } catch {
    return 0;
  }
}


// ================= PING Command =================
cmd({
  pattern: "ping",
  alias: ["speed", "pong"],
  desc: "Check bot's response time.",
  category: "main",
  react: "😵‍💫",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    const startTime = Date.now();
    const msg = await conn.sendMessage(from, { text: '*𝙿𝙸𝙽𝙶𝙸𝙽𝙶...*' });
    const endTime = Date.now();
    const ping = endTime - startTime;

    await conn.sendMessage(from, {
      text: `* ${botName} : ${ping}ms*`
    }, { quoted: msg });

  } catch (e) {
    console.error("Ping Command Error:", e);
    reply(`❌ ${e.message}`);
  }
});

// ================= SYSTEM INFO Command =================
cmd({
  pattern: "system",
  alias: ["status", "botinfo"],
  desc: "Check bot runtime, system usage and version",
  category: "main",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { reply, from }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    const developerNumber = config.DEV_NUM || "94772469026";
    const developerName = config.DEV_NAME || "shashika dilshan";
    const mem = getMemoryUsage();
    const uptime = formatUptime(process.uptime());
    const platform = `${os.type()} ${os.arch()} (${os.platform()})`;
    const hostname = os.hostname();
    const cpuLoad = os.loadavg()[0] ? os.loadavg()[0].toFixed(2) : "N/A";
    const totalUsers = getTotalUsers();

    let status = `
⋘─────━  ${botName} SYSTEM INFO  ━─────⋙
⏳ Uptime      : ${uptime}
🧠 RAM Usage   : ${mem.rss}MB / ${mem.total}MB
💻 CPU Load    : ${cpuLoad}%
🖥 Platform    : ${platform}
🏷 Hostname    : ${hostname}
🔋 Status      : Online 24/7
🆚 Version     : ${pkg.version}
👤 Owner       : ${owner}
👾 developer   : ${developerNumber},${developerName}
⋘──────────────────────────────⋙`;

    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL }
      caption: status
    }, { quoted: mek });

  } catch (e) {
    console.error("System Command Error:", e);
    reply(`⚠️ Error: ${e.message}`);
  }
});

// ================= OWNER Command =================
cmd({
  pattern: "owner",
  desc: "Show owner contact info.",
  category: "main",
  react: "👤",
  filename: __filename
}, async (conn, mek, m, { from }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const ownernumber = config.BOT_NUM || "94772469026";
    const botName = config.BOT_NAME || "𝐀𝐆𝐍𝐈";
    const caption = `
    ✬ *𝙾𝚠𝚗𝚎𝚛 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗*
    ⋘──────────────────────────────⋙
  ✪. *Ｎａｍｅ*: ${owner}
  ✪. *Ｏｗｎｅｒ ｎｕｍｂｅｒ*: ${ownernumber}
  

> *© ${botName}`;

    await conn.sendMessage(from, {
      image: { url: "https://files.catbox.moe/x1cj4y.jpg" },
      caption
    }, { quoted: mek });

  } catch (e) {
    console.error("Owner Command Error:", e);
  }
});

// ================= RUNTIME Command =================
cmd({
  pattern: "runtime",
  desc: "Show bot uptime only.",
  category: "main",
  react: "⏳",
  filename: __filename
}, async (conn, mek, m, { from }) => {
  try {
    const text = `☣️Bot Uptime: *${formatUptime(process.uptime())}*`;
    await conn.sendMessage(from, { text }, { quoted: mek });
  } catch (e) {
    console.error("Runtime Command Error:", e);
  }
});

// ================= TIME Command =================
cmd({
  pattern: "time",
  desc: "Show current SL date & time.",
  category: "main",
  react: "🕒",
  filename: __filename
}, async (conn, mek, m, { from }) => {
  try {
    const currentTime = moment().tz("Asia/Colombo");
    const date = currentTime.format("dddd, D MMMM YYYY");
    const time = currentTime.format("hh:mm:ss A");
    const msg = `
    🌩️ *DATE*: ${date}
    ⏰ *Time*: ${time}`;

    await conn.sendMessage(from, { text: msg }, { quoted: mek });
  } catch (e) {
    console.error("Time Command Error:", e);
  }
});

// ================= ABOUT Command =================
cmd({
  pattern: "about",
  desc: "Show bot information.",
  category: "main",
  react: "ℹ️",
  filename: __filename
}, async (conn, mek, m, { from }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    const caption = `
  
  ༒* ${botName} 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧*
• Name       : ${botName}
• Version    : ${pkg.version}
• Owner      : ${owner}
• Platform   : ${os.type()} ${os.arch()}

> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 ${botName}*`;

    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL },
      caption
    }, { quoted: mek });
  } catch (e) {
    console.error("About Command Error:", e);
  }
});

cmd({
  pattern: "setting",
  alias: ["setmenu", "configmenu"],
  desc: "Show bot settings menu",
  category: "main",
  react: "⚙️",
  filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
  try {
    if (!isCreator) return reply("📛 *Only Owner Can Access Settings!*");

    const c = await readEnv();
    const menuImg = config.MAIN_IMAGE_URL || "https://files.catbox.moe/4kux2y.jpg";
    const menuAudio = config.MENU_AUDIO_URL || "https://files.catbox.moe/sp4tb9.ogg";

    const ON = (x) => x === "true" ? "✅ ON" : "❌ OFF";

    const menu = `
┏━━━〔 *⚙️ ${c.BOT_NAME || "AGNI"} SETTINGS MENU* 〕━━━┓

┃ 🏷 *PREFIX:* ${c.PREFIX}
┃ 🔮 *MODE:* ${c.MODE}
┃ 🗣 *LANGUAGE:* ${c.LANGUAGE}

┃─────────────
┃ 🤖 *BOT FEATURES*
┃ • AUTO STICKER: ${ON(c.AUTO_STICKER)}
┃ • AUTO VOICE: ${ON(c.AUTO_VOICE)}
┃ • AUTO REPLY: ${ON(c.AUTO_REPLY)}
┃ • AUTO TIMER: ${ON(c.AUTO_TIMER)}
┃ • HEART REACT: ${ON(c.HEART_REACT)}
┃ • OWNER REACT: ${ON(c.OWNER_REACT)}
┃ • AUTO REACT (chat): ${ON(c.AUTO_REACT)}
┃ • AUTO REACT (status): ${ON(c.AUTO_REACT_STATUS)}
┃ • AUTO STATUS READ: ${ON(c.AUTO_READ_STATUS)}

┃─────────────
┃ 🧠 *ANTI SYSTEM*
┃ • ANTI DELETE: ${ON(c.ANTI_DELETE)}
┃ • ANTI VIEW ONCE: ${ON(c.ANTI_VIEW_ONCE)}
┃ • ANTI BAD WORD: ${ON(c.ANTI_BAD_WORD)}
┃ • ANTI LINK GROUP: ${ON(c.ANTI_LINK)}
┃ • ANTI LINK DM: ${ON(c.INBOX_ANTILINK)}
┃ • INBOX BLOCK: ${ON(c.INBOX_BLOCK)}
┃ • ANTI BOT: ${ON(c.ANTI_BOT)}

┃─────────────
┃ ⭐ *STATUS CONTROL*
┃ • ALWAYS ONLINE: ${ON(c.ALWAYS_ONLINE)}
┃ • READ MESSAGE: ${ON(c.READ_MESSAGE)}
┃ • FAKE RECORDING: ${ON(c.FAKE_RECORDING)}
┃ • AUTO TYPING: ${ON(c.AUTO_TYPING)}

┃─────────────
┃ 🎧 *AUTO FEATURES*
┃ • AUTO TIKTOK: ${ON(c.AUTO_TIKTOK)}
┃ • AUTO NEWS: ${ON(c.AUTO_NEWS_ENABLED)}
┃ • SEND FIRST NEWS: ${ON(c.SEND_START_NEWS)}

┃─────────────
┃ 🎨 *MENU CUSTOMIZATION*
┃ • BOT NAME: ${c.BOT_NAME}
┃ • OWNER NAME: ${c.OWNER_NAME}
┃ • OWNER NUMBER: ${c.OWNER_NUM}
┃ • OWNER EMOJI: ${c.OWNER_EMOJI}
┃ • DEVELOPER NUMBER: ${c.DEV_NUM}
┃ • DEVELOPER NAME: ${c.DEV_NAME}
┃ • MENU IMAGE: ${c.MENU_IMAGE_URL ? "🖼 SET" : "⚠️ NOT SET"}
┃ • MAIN IMAGE: ${c.MAIN_IMAGE_URL ? "🖼 SET" : "⚠️ NOT SET"}
┃ • ALIVE IMAGE: ${c.ALIVE_IMAGE_URL ? "🖼 SET" : "⚠️ NOT SET"}
┃ • MENU AUDIO: ${c.MENU_AUDIO_URL ? "🎵 SET" : "⚠️ NOT SET"}
┃ • ALIVE MESSAGE: ${c.ALIVE_MSG}
┃ • CHANNELS: ${c.CHANNELS ? "🖼 SET" : "⚠️ NOT SET"}

┗━━━━━━━━━━━━━━━━━━━━━┛

🧾 *Usage:* 
> .set <setting_name> on/off
> Example: *.set auto-sticker on*
> Example: *.set anti-delete off*
`;
    await conn.sendMessage(from, { image: { url: menuImg }, caption: desc }, { quoted: mek});
    await conn.sendMessage(from, {
      audio: { url: menuAudio },
      mimetype: 'audio/ogg',
      ptt: true
    }, { quoted: mek });
                  

    await reply(menu);

  } catch (e) {
    reply("⚠️ Error: " + e.message);
  }
});
