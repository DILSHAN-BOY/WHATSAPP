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
      logo: '', anime: '', other: '', tools ''  
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

// ============================================
// INTERACTIVE MENU (.menu2)
// ============================================

cmd({
    pattern: "menu2",
    alias: ["list"],
    desc: "bot's commands",
    react: "📜",
    category: "main"
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let desc = `*👋 Hello ${user}*

*╭─「 $${botName} MENU2🍂🍃」*
*│◈ ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│◈ ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│◈ ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│◈ ᴠᴇʀꜱɪᴏɴ : 3.0.0*
*╰──────────●●►*

*╭╼╼╼╼╼╼╼╼╼╼*
*├ 1 • MAIN*
*├ 2 • SEARCH*
*├ 3 • DOWNLOAD*
*├ 4 • GROUP*
*├ 5 • OWNER*
*├ 6 • FUN*
*╰╼╼╼╼╼╼╼╼╼╼*

_*🌟 Reply with the Number you want to select*_

> *𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}*`;

        const vv = await conn.sendMessage(from, { image: { url: menuImg }, caption: desc }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id) {
                switch (selectedOption) {
                    case '1':
                    reply(`
                    

╔════════════════════════╗  
║ 🔧 **𝗠𝗔𝗜𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧** 🔧 ║  
╚════════════════════════╝  

╭─━─〔 ⚡ **Commands** ⚡ 〕━━╮  
${menu.main || '│ (No commands found)'}
╰─━─━─━─━─━─━─━─━─╯  

📊 **Total Commands in MAIN:** 7  
 
> 💡 **𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}**  

`);

                        break;
                    case '2':               
                        reply(`

╔════════════════════════╗  
║ 🔍 **𝗦𝗘𝗔𝗥𝗖𝗛 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧** 🔍 ║  
╚════════════════════════╝  

╭─━〔 ⚡ **Commands** ⚡ 〕━──━╮  
${menu.search || '│ (No commands found)'}
╰─━─━─━━─━─━─━─━─━─╯  

📊 **Total Commands in SEARCH:** 2

> 💡 **𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}**
`);
                        break;
                    case '3':               
                        reply(`
╔════════════════════════╗  
║ 📥 **𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧** 📥 ║  
╚════════════════════════╝  

╭─━━〔 ⚡ **Commands** ⚡ 〕━─━━╮  
${menu.download || '│ (No commands found)'}
╰─━─━─━─━─━─━─━─━─━─╯  

📊 **Total Commands in DOWNLOAD:** 12
 
> 💡 **𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}**  

`);
                    
                        break;
                    case '4':               
                        reply(`
╔════════════════════════╗  
║ 👥 **𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧** 👥 ║  
╚════════════════════════╝  

╭─━──━〔 ⚡ **Commands** ⚡ 〕━─━╮  
${menu.group || '│ (No commands found)'}
╰─━─━─━─━─━─━─━─━─━━─╯  

📊 **Total Commands in GROUP:** 20  


> 💡 **𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}**  
`);
                    break;
                    case '5':               
                        reply(`
╔════════════════════════╗  
║ 👨‍💻 **𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧** 👨‍💻 ║  
╚════════════════════════╝  

╭─━〔 🍿 **Commands** 🍿 〕━──━╮ 
${menu.owner || '│ (No commands found)'}
╰─━━─━─━──━─━─━━─━─╯  

📊 **Total Commands in Owner:** 9

 
> 💡 **𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}**  

`);
                    break;
                    case '6':               
                        reply(`
╔════════════════════════╗  
║ 👨‍💻 **𝐓𝐎𝐎𝐋𝐒 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧** 👨‍💻 ║  
╚════════════════════════╝  

╭─━〔 🍿 **Commands** 🍿 〕━──━╮ 
${menu.tool || '│ (No commands found)'}
╰─━━─━─━──━─━─━━─━─╯  

📊 **Total Commands in Owner:** 10

 
> 💡 **𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 ${botName}**  

`);
                       
                        
                    break;
                    default:
                    
                        reply("Invalid option. Please select a valid option🔴");
                }

            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply('An error occurred while processing your request.');
    }
});
              
