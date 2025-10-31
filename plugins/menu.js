const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');

cmd({
    pattern: "menu",
    react: "👾",
    desc: "get cmd list",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, pushname }) => {
    try {
        const config = await readEnv();

        const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek });

        let menu = { main: '', download: '', group: '', owner: '', convert: '', search: '' };

        for (let i = 0; i < commands.length; i++) {
            const cat = commands[i].category || 'main';
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                if (!menu[cat]) menu[cat] = '';
                menu[cat] += `*┋* ${commands[i].pattern}\n`;
            }
        }

        let madeMenu = `*╭─ AGNI MENU ─╮*\n*Hi ${pushname}*\n\n` +
            `*╭─ DOWNLOAD CMDS ─╮*\n${menu.download}*╰─────────*\n` +
            `*╭─ MAIN CMDS ─╮*\n${menu.main}*╰─────────*\n` +
            `*╭─ GROUP CMDS ─╮*\n${menu.group}*╰─────────*\n` +
            `*╭─ OWNER CMDS ─╮*\n${menu.owner}*╰─────────*\n` +
            `*╭─ CONVERT CMDS ─╮*\n${menu.convert}*╰─────────*\n` +
            `*╭─ SEARCH CMDS ─╮*\n${menu.search}*╰─────────*\n` +
            `> Powered by AGNI`;

        if (config.MENU_IMG) {
            await conn.sendMessage(from, { image: { url: config.MENU_IMG }, caption: madeMenu }, { quoted: mek });
        } else {
            reply(madeMenu);
        }

    } catch (e) {
        console.error(e);
        conn.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: mek });
    }
});
