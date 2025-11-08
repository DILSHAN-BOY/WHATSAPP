const fs = require('fs');
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu",
    desc: "Show interactive menu system",
    category: "menu",
    react: "📂",
    filename: __filename
}, async (conn, mek, m, { from, reply, pushname }) => {
    try {
      const config = await readEnv();
    const prefix = config.PREFIX || ".";
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const developerName = config.DEV_NAME || "SHASHIKA DILSHAN";
    const botName = config.BOT_NAME || "AGNI";
    const menuImg = config.MENU_IMAGE_URL || "https://files.catbox.moe/4kux2y.jpg";  
    const menuVid = config.MENU_VIDEO_URL || "https://files.catbox.moe/kjlx3l.mp4";
    const menuAudio = config.MENU_AUDIO_URL || "https://files.catbox.moe/sp4tb9.ogg";
//=======system ====================   
  const user = pushname;
const uptime = runtime(process.uptime());
const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0) + "MB";
const totalRam = (require('os').totalmem() / 1024 / 1024).toFixed(0) + "MB";
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


        const menuCaption = `
        
👋 𝐇𝐄𝐋𝐋𝐎, ${pushname}!

*♻️ 𝗪ELCOME TO ${botName} 🍃*
╭─「 🛠️ ${developerName} 」 
│🤖 *Bot*: ${botName}
│🙋‍♂️ *User*: ${user}
│📱 *Owner*: ${owner}
│⏳ *Uptime*: ${uptime}
│💾 *Ram*: ${usedRam} / ${totalRam}
│🛎️ *Prefix*: ${config.PREFIX}
╰──────────●●►

╭──◯┄─◉──◉──❀──❂
┆ * ◉ BOT MENU ◉ *
╰───┄ °❀
❀° ┄───❀° ┄───❦
┆ ⭔① *Main menu*
┆ ⭔② *Ai menu*
┆ ⭔③ *Convert menu*
┆ ⭔④ *Download menu*
┆ ⭔⑤ *Search menu*
┆ ⭔⑥ *Group menu*
┆ ⭔⑦ *Owner menu*
┆ ⭔⑧ *Tools menu*
┆ ⭔⑨ *other menu*
┆ ⭔⑩ *anime & logo menu*
╰───┄ °❀❀° ┄───❦

> *• © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 ${developerName} •*`;

const contextInfo = {
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true
};
const sentMsg =await conn.sendMessage(from, { image: { url: menuImg }, caption: menuCaption }, { quoted: mek });


    // Send voice note separately
    await conn.sendMessage(from, {
      audio: { url: menuAudio },
      mimetype: 'audio/ogg',
      ptt: true
    }, { quoted: mek });

// Remove the 'let' if it's already declared above
// let sentMsg;

try {
    sentMsg = await Promise.race([
        sendMenuImage(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Image send timeout')), 10000))
    ]);
} catch (e) {
    console.log('Menu send error:', e);
    // Use the same variable, don't redeclare
    sentMsg = await conn.sendMessage(
        from,
        { text: menuCaption, contextInfo: contextInfo },
        { quoted: mek }
    );
}

const messageID = sentMsg.key.id;

        // Menu data (Trimmed sample - you can keep all your sections)
        const menuData = {
            '1': {
                title: "MAIN",
                content: `☘️《《⚛*MAIN COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.main || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
              const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['1'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '2': {
                title: "*🤖 Ai Menu*",
                content: `🌿 《《⚛*AI COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━𖣔
${menu.ai || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: © ${botName}*`,
                const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['2'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '3': {
                title: "🎧 *Convert Menu*",
                content: `☘️《《⚛*CONVERT COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.convert || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
              const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['3'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '4': {
                title: "📥 *Download Menu*",
                
                content: `☘️《《⚛*DOWNLOAD COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.download || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
              const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['4'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '5': {
                title: "🔍 *Search Menu*",
                
                content: `☘️《《⚛*SEARCH COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.search || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
              const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['5'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '6': {
                title: "👥 *Group Menu*",
                
                content: `☘️《《⚛*GROUP COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.group || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
             const sentMsg = await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['6'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '7': {
                title: "👑 *Owner Menu*",
                
                content: `☘️《《⚛*OWNER COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.owner || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
              const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['7'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '8': {
                title: "🧰 *Tools Menu*",
                
                content: `☘️《《⚛*TOOLS COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.tools || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
             const sentMsg = await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['8'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
            },
            '9': {
                title: "📰 *other Menu*",
                
                content: `☘️《《⚛*OTHER COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.other || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
              const sentMsg =await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['9'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
             },
            '10': {
                title: "🤣 *anim & logo Menu*",
                
                content: `☘️《《⚛*ANIME & LOGO COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.anime || '│ (No commands found)'}
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.logo || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
             const sentMsg = await conn.sendMessage(from, { 
    image: { url: menuImg }, 
    caption: menuData['10'].content, // menuData object එකේ proper content එක
}, { quoted: mek });
                
            }

        };

        // Message handler for menu replies
        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const isReplyToMenu =
                    receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (isReplyToMenu) {
                    const receivedText =
                        receivedMsg.message.conversation ||
                        receivedMsg.message.extendedTextMessage?.text;
                    const senderID = receivedMsg.key.remoteJid;

                    if (menuData[receivedText]) {
                        const selectedMenu = menuData[receivedText];

                        try {
                            if (selectedMenu.image) {
                                await conn.sendMessage(
                                    senderID,
                                    {
                                        image: { url: 'https://files.catbox.moe/4kux2y.jpg' },
                                        caption: selectedMenu.content,
                                        contextInfo: contextInfo
                                    },
                                    { quoted: receivedMsg }
                                );
                            } else {
                                await conn.sendMessage(
                                    senderID,
                                    { text: selectedMenu.content, contextInfo: contextInfo },
                                    { quoted: receivedMsg }
                                );
                            }

                            await conn.sendMessage(senderID, {
                                react: { text: '✅', key: receivedMsg.key }
                            });
                        } catch (e) {
                            console.log('Menu reply error:', e);
                            await conn.sendMessage(
                                senderID,
                                { text: selectedMenu.content, contextInfo: contextInfo },
                                { quoted: receivedMsg }
                            );
                        }
                    } else {
                        await conn.sendMessage(
                            senderID,
                            {
                                text: `❌ *Invalid Option!* ❌\n\nPlease reply with a number between 1–9.\n\n*Example:* Reply with "1" for Main Menu\n\n> *Powered by: © 𝚅𝙸𝙻𝙾𝙽-𝚇-𝙼𝙳*`,
                                contextInfo: contextInfo
                            },
                            { quoted: receivedMsg }
                        );
                    }
                }
            } catch (e) {
                console.log('Handler error:', e);
            }
        };

        // Add message listener
        conn.ev.on('messages.upsert', handler);

        // Remove listener after 5 minutes
        setTimeout(() => {
            conn.ev.off('messages.upsert', handler);
        }, 300000);
    } catch (e) {
        console.error('Menu Error:', e);
        try {
            await conn.sendMessage(
                from,
                { text: `❌ Menu system is busy. Please try again later.\n\n> ${config.DESCRIPTION}` },
                { quoted: mek }
            );
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});
      
