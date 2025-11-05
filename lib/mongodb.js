const mongoose = require('mongoose');
const config = require('../config');
const EnvVar = require('./mongodbenv');
 
const defaultEnvVariables = [
    { key: 'PREFIX', value: '.' },
    { key: 'MODE', value: 'public' },
    { key: 'AUTO_READ_STATUS', value: 'true' },
    { key: 'AUTO_REACT_STATUS', value: 'true' },
    { key: 'LANGUAGE', value: 'sinhala' },
    { key: 'AUTO_REACT', value: 'true' }, 
    { key: 'FAKE_RECORDING', value: 'true' },
    { key: 'AUTO_TYPING', value: 'true' },
    { key: 'ANTI_LINK', value: 'true' },
    { key: 'AUTO_VOICE', value: 'true' },
    { key: 'AUTO_REPLY', value: 'true' },
    { key: 'CHR_MODE', value: 'true' },
    { key: 'ANTI_BAD_WORD', value: 'true' },
    { key: 'ANTI_DELETE', value: 'true' },
    { key: 'ANTI_VIEW_ONCE', value: 'true' },
    { key: 'READ_MESSAGE', value: 'true' },
    { key: 'AUTO_TIMER', value: 'true' },
    { key: 'ALWAYS_ONLINE', value: 'true' },
    { key: 'ANTI_DELETE', value: 'true' },
    { key: 'INBOX_ANTILINK', value: 'false' },
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
    { key: 'OWNER_NUM', value: '94772469026' },
    { key: 'MENU_IMAGE_URL', value: 'https://files.catbox.moe/8bkx4q.jpg' },
    { key: 'MENU_AUDIO_URL', value: 'https://files.catbox.moe/sp4tb9.ogg' },
    { key: 'BAD_WORD_LIST', value: 'wtf,mia,xxx,fuck,sex,huththa,pakaya,ponnaya,hutto'},
];

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB);
        console.log('Ⓜ️ongoDB Connected ✔️');

        // Create default values if missing
        for (const envVar of defaultEnvVariables) {
            const existingVar = await EnvVar.findOne({ key: envVar.key });
            if (!existingVar) {
                await EnvVar.create(envVar);
                console.log(`🔰 Created default env var: ${envVar.key}`);
            }
        }

        // Override config.js values from database
        const allVars = await EnvVar.find({});
        allVars.forEach(env => {
            config[env.key] = env.value;
        });

        console.log('🔄 Config synced from database ✔️');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
    
