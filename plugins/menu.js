const fs = require('fs');
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');

cmd({
  pattern: "menu",
  react: "🔥",
  alias: ["allmenu", "help"],
  desc: "Show command menu",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, quoted, pushname, reply }) => {
  try {
    //=== Load dynamic config from MongoDB ===//
    const config = await readEnv();
    const prefix = config.PREFIX || ".";
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    const menuImg = config.MENU_IMAGE_URL || "https://files.catbox.moe/4kux2y.jpg";
    const menuVid = config.MENU_VIDEO_URL || "https://files.catbox.moe/hv5i0u.mp4"; // <-- Add video link here
    const menuAudio = config.MENU_AUDIO_URL || "https://files.catbox.moe/f4ohfr.mp3"; // <-- Add audio link here

    //=== System Stats ===//
    const user = pushname || m.sender.split('@')[0];
    const uptime = new Date(process.uptime() * 1000).toISOString().substr(11, 8);
    const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const totalRam = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1);

    //=== Menu Categories ===//
    let menu = {
      main: '', group: '', owner: '', ai: '',
      download: '', search: '', convert: '',
      logo: '', anime: '', other: ''
    };

    //=== Auto add commands by category ===//
    for (let c of commands) {
      if (c.pattern && !c.dontAddCommandList && menu.hasOwnProperty(c.category)) {
        menu[c.category] += `│ ⬡ ${prefix}${c.pattern}\n`;
      }
    }

    //=== Menu Message ===//
    let caption = `
👋 𝐇𝐞𝐲 ${user},

*⚡ Welcome To ${botName} ⚡*

╭─「 🧠 System Info 」
│🤖 *Bot* : ${botName}
│👤 *Owner* : ${owner}
│📱 *User* : ${user}
│💻 *RAM* : ${usedRam} / ${totalRam} MB
│⏱️ *Uptime* : ${uptime}
│⌨️ *Prefix* : ${prefix}
╰───────────────❖

╭─「 ⚛ ${botName} Command Menu ⚛ 」
│ ⚙️ *MAIN COMMANDS*
${menu.main || '│ (none)'}
│ 🧩 *GROUP COMMANDS*
${menu.group || '│ (none)'}
│ 🎧 *DOWNLOAD COMMANDS*
${menu.download || '│ (none)'}
│ 🤖 *AI COMMANDS*
${menu.ai || '│ (none)'}
│ 🧠 *CONVERT COMMANDS*
${menu.convert || '│ (none)'}
│ 🧑‍💻 *OWNER COMMANDS*
${menu.owner || '│ (none)'}
│ 🌸 *LOGO / ANIME*
${menu.logo || ''}${menu.anime || ''}
│ 🔍 *SEARCH COMMANDS*
${menu.search || '│ (none)'}
│ ⚡ *OTHER COMMANDS*
${menu.other || ''}
╰────────────────❖

> *Powered By ${botName}*
> *Developed by ${owner}*
`;

    //=== Send Round Video (like profile video) ===//
    await conn.sendMessage(from, {
      video: { url: menuVid },
      caption,
      gifPlayback: true, // makes it loop like a GIF
      mimetype: 'video/mp4',
      fileName: `${botName}_Menu.mp4`
    }, { quoted: mek });

    //=== Send Menu Audio ===//
    await conn.sendMessage(from, {
      audio: { url: menuAudio },
      mimetype: 'audio/mp4',
      ptt: true // makes it play like a voice note
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Menu Error: " + err.message);
  }
});

// ============================================
// INTERACTIVE MENU (.menu2)
// ============================================

let menuCache = {}; // Temporary state store

cmd({
  pattern: "menu2",
  react: "🧭",
  desc: "Interactive category menu",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
  try {
    const config = await readEnv();
    const botName = config.BOT_NAME || "AGNI-MD";

    const categories = [
      "👥 Group Commands",
      "📥 Download Commands",
      "🤖 AI Commands",
      "⚙️ Convert Commands",
      "👑 Owner Commands",
      "🎨 Logo / Anime",
      "🔍 Search Commands",
      "⚡ Other Commands"
    ];

    let menuText = `╭───💫 *${botName} MENU* 💫───╮\n`;
    menuText += `│ 🧭 *Choose a Category:*\n│\n`;
    categories.forEach((cat, i) => {
      menuText += `│ ${i + 1}. ${cat}\n`;
    });
    menuText += `╰────────────────────────────╯\n\n_Reply with a number (1-8)_`;

    await reply(menuText);
    menuCache[sender] = { step: "choose", prefix: config.PREFIX || "." };

  } catch (err) {
    console.log(err);
    reply("❌ Error showing menu2: " + err.message);
  }
});

cmd({ on: "message" }, async (conn, mek, m, { from, body, sender, reply }) => {
  try {
    if (!menuCache[sender]) return;
    const userState = menuCache[sender];
    if (userState.step !== "choose") return;

    const choice = parseInt(body.trim());
    if (isNaN(choice) || choice < 1 || choice > 8) {
      return reply("⚠️ Invalid choice! Please reply with a number (1-8).");
    }

    const categoryMap = {
      1: "group",
      2: "download",
      3: "ai",
      4: "convert",
      5: "owner",
      6: "logo",
      7: "search",
      8: "other"
    };

    const selectedCategory = categoryMap[choice];
    const selectedCommands = commands.filter(c => c.category === selectedCategory && c.pattern);

    let menuList = `╭───📜 *${selectedCategory.toUpperCase()} COMMANDS* 📜───╮\n`;
    if (selectedCommands.length === 0) {
      menuList += "│ (No commands found)\n";
    } else {
      selectedCommands.forEach((cmdObj, i) => {
        menuList += `│ ${i + 1}. ⚡ ${userState.prefix}${cmdObj.pattern}  —  ${cmdObj.desc || ''}\n`;
      });
    }
    menuList += `╰────────────────────────────╯`;

    await reply(menuList);
    delete menuCache[sender];

  } catch (err) {
    console.error(err);
    reply("❌ Menu2 Error: " + err.message);
  }
});
      
