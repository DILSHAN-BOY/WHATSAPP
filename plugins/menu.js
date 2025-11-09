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

// Function to send the main menu image
const sendMenuImage = async () => {
    try {
        return await conn.sendMessage(
            from,
            {
               image: { url: config.MENU_IMAGE_URL },
                caption: menuCaption,
                contextInfo: contextInfo
            },
            { quoted: mek }
        );
    } catch (e) {
        console.log('Image send failed, falling back to text');
        return await conn.sendMessage(
            from,
            { text: menuCaption, contextInfo: contextInfo },
            { quoted: mek }
        );
    }
};

// Try sending menu image with timeout
let sentMsg;
try {
    sentMsg = await Promise.race([
        sendMenuImage(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Image send timeout')), 10000000))
    ]);
} catch (e) {
    console.log('Menu send error:', e);
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
                title: "🎀 *Main Menu*",
                content: `☘️《《⚛*MAIN COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.main || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '2': {
                title: "*🤖 Ai Menu*",
                content: `🌿 《《⚛*AI COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━𖣔
${menu.ai || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: © ${botName}*`,
                image: true
            },
            '3': {
                title: "🎧 *Convert Menu*",
                content: `♻️《《⚛*CONVERT COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.convert || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '4': {
                title: "📥 *Download Menu*",
                content: `🍃《《⚛*DOWNLOAD COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.download || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '5': {
                title: "🔍 *Search Menu*",
                content: `🍂《《⚛*SEARCH COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.search || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '6': {
                title: "👥 *Group Menu*",
                content: `❤️‍🔥《《⚛*GROUP COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.group || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '7': {
                title: "👑 *Owner Menu*",
                content: `☘️《《⚛*OWNER COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.owner || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '8': {
                title: "🧰 *Tools Menu*",
                content: `🌱《《⚛*TOOLS COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.tools || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
            },
            '9': {
                title: "📰 *Other Menu*",
                content: `🌼《《⚛*OTHER COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.other || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
             },
            '10': {
                title: "🤣 *Logo&Anime Menu*",
                content: `🍁《《⚛*LOGO & ANIME COMMANDS*⚛》》
𖣔━━━━━━━━━━━━━━━𖣔
│ ${menu.anime || '│ (No commands found)'}
│ ${menu.logo || '│ (No commands found)'}
┗━━━━━━━━━━━━━━━𖣔

> *Powered by: ${botName}*`,
                image: true
                
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
                                        image: { url: config.MENU_IMAGE_URL },
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
                                text: `❌ *Invalid Option!* ❌\n\nPlease reply with a number between 1–9.\n\n*Example:* Reply with "1" for Main Menu\n\n> *Powered by: © ${botName}*`,
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
                { text: `🛑something worn. Please try again later` },
                { quoted: mek }
            );
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});
        
