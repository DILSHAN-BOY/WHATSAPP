const fs = require('fs');
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');

// ============================================
// MENU (.menu) — Video + Voice Note
// ============================================
cmd({
  pattern: "menu",
  react: "🔥",
  alias: ["allmenu", "help"],
  desc: "Show command menu",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, pushname, reply }) => {
  try {
    const config = await readEnv();
    const prefix = config.PREFIX || ".";
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    const menuImg = config.MENU_IMAGE_URL || "https://files.catbox.moe/4kux2y.jpg"; 
    const menuAudio = config.MENU_AUDIO_URL || "https://files.catbox.moe/sp4tb9.ogg";

    //=== System Stats ===//  
    const user = pushname || m.sender.split('@')[0];  
    const uptime = new Date(process.uptime() * 1000).toISOString().substr(11, 8);  
    const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);  
    const totalRam = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1);  
  
    //=== Menu Categories ===//  
    let menu = {  
      main: '', group: '', owner: '', ai: '',  
      download: '', search: '', convert: '',  
      logo: '', anime: '', other: '', tools: ''  
    };  
  
    //=== Auto add commands by category ===//  
    for (let c of commands) {  
      if (c.pattern && !c.dontAddCommandList && menu.hasOwnProperty(c.category)) {  
        menu[c.category] += `│ ⬡ ${prefix}${c.pattern}\n`;  
      }  
    }  

    //=== Caption ===//
    let caption = `𝐘𝐨𝐨  ${user}
*Wᴇʟᴄᴏᴍᴇ Tᴏ ΛGПI* 

╭─「 🛠️ 𝐒𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐃𝐢𝐥𝐬𝐡𝐚𝐧 」 
│🤖 *Bot*: ${botName}
│🙋‍♂️ *User*: ${user}
│📱 *Owner*: ${owner}
│⏳ *Uptime*: ${uptime}
│💾 *Ram*: ${usedRam} / ${totalRam}
│🛎️ *Prefix*: ${config.PREFIX}
╰──────────●●►

╭─「 ⚛${botName}⚛ MENU━━𖣔 」


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

│ ♻️《《⚛*TOOLS COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.tools || '│ (No commands found)'}

│ 🌱 《《⚛*OWNER COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.owner || '│ (No commands found)'}

│ 🌵 《《⚛*CONVERT COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.convert || '│ (No commands found)'}

│ 🌿 《《⚛*AI COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.ai || '│ (No commands found)'}

│ 🍁 《《⚛*LOGO/ANIME COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.logo || '│ (No commands found)'}
${menu.anime || '│ (No commands found)'}

│ ♻️《《⚛*SEARCH COMMANDS*⚛》》
┗━━━━━━━━━━━━━━━𖣔
${menu.search || '│ (No commands found)'}

╰──────────●●►

> *Powered By ${botName}*
> *Developed by ${owner}*
`;

    // === Send Media Menu === //
    await conn.sendMessage(from, { image: { url: menuImg }, caption }, { quoted: mek });

    await conn.sendMessage(from, {
      audio: { url: menuAudio },
      mimetype: 'audio/ogg',
      ptt: true
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Menu Error: " + err.message);
  }
});
