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

    await conn.sendMessage(from, {
      image: { url: menuImg },
      caption
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Menu Error: " + err.message);
  }
});
