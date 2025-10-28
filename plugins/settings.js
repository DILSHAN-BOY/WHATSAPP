

const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "settings",
    react: "🎛️",
    alias: ["setting", "env"],
    desc: "Get bot's settings list.",
    category: "main",
    use: '.settings',
    filename: __filename
}, async (conn, mek, m, {
    from,
    quoted,
    body,
    isCmd,
    args,
    q,
    isGroup,
    sender,
    senderNumber,
    botNumber2,
    botNumber,
    pushname,
    isMe,
    isOwner,
    groupMetadata,
    groupName,
    participants,
    groupAdmins,
    isBotAdmins,
    isAdmins,
    reply
}) => {
    try {
        // Function to return ✅ or ❌ based on the boolean value, considering multiple formats
        const statusIcon = (status) => {
            return (status === true || status === 'true' || status === 1) ? "✅" : "❌";
        };

        // Create the settings message with the updated format
        let madeSetting = `╭───⚙️ *${config.BOT_NAME} Settings* ⚙️───╮
│
│ ⚙️ *➤ Mode*: *${config.MODE}*
│ ✉️ *➤ Alive Message*: *${config.ALIVE_MSG} ]*
│ ⌨️ *➤ Prefix*: *[ ${config.PREFIX} ]*
│ 🤖 *➤ Bot Name*: *${config.BOT_NAME}*
│
╰──────────────────────────╯

*ₚₒwₑᵣₑd by ₛₕₐₛₕᵢₖₐ dᵢₗₛₕₐₙ*
`;

        // Send the settings message with the updated format
        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: madeSetting
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
  
