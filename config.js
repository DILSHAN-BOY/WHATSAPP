const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "suho~7RlHlSTT#WdJg5kL4mLQQXD22ZrixMPVdwwen73u-e3tv_goDP3k",
MONGODB: process.env.MONGODB || "mongodb://mongo:FbAOzhLzBjBIoyVZegPugoscYfHbHsef@hopper.proxy.rlwy.net:35489",
OPENAI_API_KEY: process.env.OPENAI_API_KEY || "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"
};
