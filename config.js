const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "suho~7RlHlSTT#WdJg5kL4mLQQXD22ZrixMPVdwwen73u-e3tv_goDP3k",
MONGODB: process.env.MONGODB || "mongodb://mongo:FbAOzhLzBjBIoyVZegPugoscYfHbHsef@hopper.proxy.rlwy.net:35489"
};
