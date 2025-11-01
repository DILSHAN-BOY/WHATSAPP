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
    const menuVid = config.MENU_VIDEO_URL || "https://files.catbox.moe/kjlx3l.mp4";
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
      logo: '', anime: '', other: ''  
    };  
  
    //=== Auto add commands by category ===//  
    for (let c of commands) {  
      if (c.pattern && !c.dontAddCommandList && menu.hasOwnProperty(c.category)) {  
        menu[c.category] += `│ ⬡ ${prefix}${c.pattern}\n`;  
      }  
    }  

    
    let caption = `𝐘𝐨𝐨  ${user}
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

> *Powered By ${botName}*
> *Developed by ${owner}*
`;

    await conn.sendMessage(from, { image: { url: menuImg }, caption: desc }, { quoted: mek });
    // Send video first (rounded corners, normal playback)
    await conn.sendMessage(from, {
      video: { url: menuVid },
      caption,
      mimetype: 'video/mp4',
      fileName: `${botName}_Menu.mp4`,
      gifPlayback: false
    }, { quoted: mek });

    // Send voice note separately
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

// ============================================
// INTERACTIVE MENU (.menu2)
// ============================================
let menuCache = {};

cmd({
  pattern: "menu2",
  react: "🧭",
  desc: "Interactive category menu",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const config = await readEnv();
    const botName = config.BOT_NAME || "AGNI";

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
      return reply("⚠️ Invalid choice! Reply with number 1-8.");
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
    if (selectedCommands.length === 0) menuList += "│ (No commands found)\n";
    else selectedCommands.forEach((cmdObj, i) => {
      menuList += `│ ${i + 1}. ⚡ ${userState.prefix}${cmdObj.pattern} — ${cmdObj.desc || ''}\n`;
    });
    menuList += `╰────────────────────────────╯`;

    await reply(menuList);
    delete menuCache[sender];

  } catch (err) {
    console.error(err);
    reply("❌ Menu2 Error: " + err.message);
  }
});
