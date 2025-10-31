

const fs = require('fs');
const {readEnv} = require('../lib/database');
const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "menu",
    react: "🤖",
    alias: ["allmenu"],
    desc: "Get command list",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, pushname, reply
}) => {
    try {
      const config = await readEnv();
        let menu = {
            download: '', group: '', search: '', owner: '',
            ai: '', anime: '', convert: '', logo: '',
            main: '', other: ''
        };

        for (let i = 0; i < commands.length; i++) {
            let cmd = commands[i];
            if (cmd.pattern && !cmd.dontAddCommandList && menu.hasOwnProperty(cmd.category)) {
                menu[cmd.category] += `│ ⬡ ${cmd.pattern}\n`;
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

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: madeMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363402507750390@newsletter',
                        newsletterName: 'Lite XD',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

        await conn.sendMessage(from, {
            audio: fs.readFileSync('./all/menu.m4a'),
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});
