const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "suho~7RlHlSTT#WdJg5kL4mLQQXD22ZrixMPVdwwen73u-e3tv_goDP3k",
ALIVE_MSG: process.env.ALIVE_MSG || "I'm ALIVE now",
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg",
BOT_NAME: process.env.BOT_NAME || "🍀𝐀𝐆𝐍𝐈🍀",
OWNER_NAME: process.env.OWNER_NAME || "𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧",
MODE: process.env.MODE || "public",
PREFIX: process.env.PREFIX || ".",
version: process.env.version || "1.0.0"
};
