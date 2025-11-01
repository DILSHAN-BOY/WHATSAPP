const mongoose = require('mongoose');
const EnvVar = require('./mongodbenv'); // EnvVar model
const config = require('../config');

const defaultEnvVariables = [
    { key: 'PREFIX', value: '.' },
    { key: 'MODE', value: 'public' },
    { key: 'AUTO_READ_STATUS', value: 'true' },
    { key: 'AUTO_REACT_STATUS', value: 'true' },
    { key: 'LANGUAGE', value: 'sinhala' },
    { key: 'AUTO_REACT', value: 'true' }, 
    { key: 'FAKE_RECORDING', value: 'false' },
    { key: 'AUTO_TYPING', value: 'true' },
    { key: 'ANTI_LINK', value: 'true' },
    { key: 'AUTO_VOICE', value: 'true' },
    { key: 'AUTO_REPLY', value: 'true' },
    { key: 'ANTI_BAD', value: 'true' },
    { key: 'READ_MESSAGE', value: 'true' },
    { key: 'ALWAYS_ONLINE', value: 'true' },
    { key: 'ANTI_DELETE', value: 'true' },
    { key: 'DELETEMSGSENDTO', value: 'none' },
    { key: 'INBOX_BLOCK', value: 'true' },
    { key: 'ANTI_BOT', value: 'false' },
    { key: 'AUTO_TIKTOK', value: 'false' },
    { key: 'AUTO_NEWS_ENABLED', value: 'false' },
    { key: 'SEND_START_NEWS', value: 'false' },
    { key: 'MOVIE_FOOTER', value: '> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧🍃*' },
    { key: 'BOT_NAME', value: '𝐀𝐆𝐍𝐈' },
    { key: 'OWNER_REACT', value: 'true' },
    { key: 'ALIVE_MSG', value: 'AGNI ALIVE NOW. . .' },
    { key: 'ALIVE_IMG', value: 'https://files.catbox.moe/ue4ppc.jpg' },
    { key: 'OWNER_NAME', value: '𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚 𝐝𝐢𝐥𝐬𝐡𝐚𝐧' },
    { key: 'OWNER_EMOJI', value: '☣️' },
    { key: 'HEART_REACT', value: 'true' },
    { key: 'OWNER_NUMBER', value: '94772469026' },
    { key: 'MENU_IMG', value: 'https://files.catbox.moe/8bkx4q.jpg' }
];

async function connectDB() {
    try {
        await mongoose.connect(config.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected ✅');

        // Default values check
        for (const envVar of defaultEnvVariables) {
            const existingVar = await EnvVar.findOne({ key: envVar.key });
            if (!existingVar) {
                await EnvVar.create(envVar);
                console.log(`🔰 Created default env var: ${envVar.key}`);
            }
        }

        console.log('🔄 Config synced from database ✅');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

// ✅ Export as function
module.exports = connectDB;
