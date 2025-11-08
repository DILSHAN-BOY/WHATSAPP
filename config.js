const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "suho~7RlHlSTT#WdJg5kL4mLQQXD22ZrixMPVdwwen73u-e3tv_goDP3k",
MONGODB: process.env.MONGODB || "mongodb://mongo:FbAOzhLzBjBIoyVZegPugoscYfHbHsef@hopper.proxy.rlwy.net:35489",
MENU_IMG: process.env.MENU_IMG || "https://files.catbox.moe/8bkx4q.jpg",
BOT_NAME: process.env.BOT_NAME || "🍀𝐀𝐆𝐍𝐈🍀",
OWNER_NAME: process.env.OWNER_NAME || "𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧",
MODE: process.env.MODE || "public",
PREFIX: process.env.PREFIX || ".",
version: process.env.version || "1.0.0",
OWNER_NUM: process.env.OWNER_NUM || "94772469026",
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
AUTO_VOICE: process.env.AUTO_VOICE || "true",
READ_MESSAGE: process.env.READ_MESSAGE || "true",
AUTO_REACT: process.env.AUTO_REACT || "false",
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
CHAT_BOT: process.env.CHAT_BOT || "true",
READ_CMD: process.env.READ_CMD || "true",
ANTI_VV: process.env.ANTI_VV || "true",
ANTI_DELETE: process.env.ANTI_DELETE || "true",
ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "inbox",
};
