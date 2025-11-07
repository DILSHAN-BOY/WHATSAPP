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
⋘──────────────────────────────⋙`;

    await conn.sendMessage(from, {
      image: { url: "https://files.catbox.moe/4kux2y.jpg" }, // <-- replace with your image URL
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
      image: { url: "https://files.catbox.moe/4kux2y.jpg" },
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
    category: "menu",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
  try {
    const config = await readEnv();
    const prefix = config.PREFIX || ".";
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";

    if (!isCreator) return reply("*📛 Only the owner can use this menu!*");

    const menuText = `
*🛠️ BOT SETTINGS MENU 🛠️*

╭──────────●●►
│◈ *PREFIX:* ${config.PREFIX}
│◈ *MODE:* ${config.MODE}
│◈ *AUTO STICKER:* ${config.AUTO_STICKER === "true" ? "✅ ON" : "❌ OFF"}
│◈ *AUTO SEEN STATUS:* ${config.AUTO_STATUS_SEEN === "true" ? "✅ ON" : "❌ OFF"}
│◈ *AUTO LIKE STATUS:* ${config.AUTO_STATUS_REACT === "true" ? "✅ ON" : "❌ OFF"}
│◈ *AUTO REACT:* ${config.AUTO_REACT === "true" ? "✅ ON" : "❌ OFF"}
│◈ *READ MESSAGE:* ${config.READ_MESSAGE === "true" ? "✅ ON" : "❌ OFF"}
│◈ *ALWAYS ONLINE:* ${config.ALWAYS_ONLINE === "true" ? "✅ ON" : "❌ OFF"}
│◈ *READ CMD:* ${config.READ_CMD === "true" ? "✅ ON" : "❌ OFF"}
│◈ *ANTI DELETE:* ${config.ANTI_DELETE === "true" ? "✅ ON" : "❌ OFF"}
╰──────────●●►

╭──────────●●►
│◈🛠️ *USAGE GUIDE:*
│◈ • _.antidelete on/off_
│◈ • _.auto-react on/off_
│◈ • _.read-message on/off_
│◈ • _.status-reply on/off_
│◈ • _.always-online on/off_
│◈ • _.auto-seen on/off_
│◈ • _.status-react on/off_
│◈ • _.mode public/private/groups_
│◈ • _.setprefix !_
╰──────────●●►

> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 ${botName}*`;

    await reply(menuText);

  } catch (e) {
    reply(`⚠️ Error: ${e.message}`);
  }
});
