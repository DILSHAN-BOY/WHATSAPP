const fs = require('fs');
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');

cmd({
  pattern: "menu",
  react: "🤖",
  alias: ["allmenu"],
  desc: "Get command list",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, quoted, pushname, reply }) => {
  try {
    const config = await readEnv();
    let user = pushname || m.sender.split('@')[0];
    let owner = config.OWNER_NAME || "Shashika";
    let uptime = Math.floor(process.uptime()) + "s";
    let usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";
    let totalRam = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " MB";

    let menu = {
      download: '', group: '', search: '', owner: '',
      ai: '', anime: '', convert: '', logo: '',
      main: '', other: ''
    };

    for (let cmdItem of commands) {
      if (cmdItem.pattern && !cmdItem.dontAddCommandList && menu.hasOwnProperty(cmdItem.category)) {
        menu[cmdItem.category] += `│ ⬡ ${cmdItem.pattern}\n`;
      }
    }

    let madeMenu = `𝐘𝐨𝐨  ${user}
*Wᴇʟᴄᴏᴍᴇ Tᴏ ΛGПI* 

╭─「 🛠️ 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧 」 
│🤖 *Bot*: 𝐀𝐆𝐍𝐈
│🙋‍♂️ *User*: ${user}
│📱 *Owner*: ${owner}
│⏳ *Uptime*: ${uptime}
│💾 *Ram*: ${usedRam} / ${totalRam}
│🛎️ *Prefix*: ${config.PREFIX}
╰──────────●●►

╭─「 ⚛𝐀𝐆𝐍𝐈⚛ MENU━━𖣔 」 
│ ⚙️ 《《⚛*MAIN COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.main || '│ (No commands found)'}
│ 🍂 《《⚛*GROUP COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.group || ''}
│ 《《⚛*OTHER COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.other || ''}
│ 🍃 《《⚛*DOWNLOAD COMMANDS*⚛》
┗━━━━━━━━━━━━━━━𖣔
${menu.download || '│ (No commands found)'}
│ 🌱 《《⚛*OWNER COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.owner || '│ (No commands found)'}
│ 🌵 《《⚛*CONVERT COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
│ 🌿 《《⚛*AI COMMANDS*⚛》》
${menu.ai || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔
${menu.convert || '│ (No commands found)'}
│ 🍁 《《⚛*LOGO/ANIME COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.logo || '│ (No commands found)'}
${menu.anime || '│ (No commands found)'}
│ ♻️《《⚛*SEARCH COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.search || '│ (No commands found)'}
╰──────────●●►

> *POWERED BY 𝐀𝐆𝐍𝐈*
`;

    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL },
      caption: madeMenu
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Menu error: " + e.message);
  }
});
