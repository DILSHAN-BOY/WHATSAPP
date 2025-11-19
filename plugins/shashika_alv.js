const { setAntiLink, getAntiLink, setAntiBadWords, getAntiBadWords } = require('../lib/SHASHIKA-data');
const { setAntiDeleteStatus, getAntiDeleteStatus } = require('../lib/database');

module.exports = [{
    cmd: ['alive'],
    handle: async ({ conn, m, from, sms, config, ownerNumber }) => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const text = `
*✅ Bot is Alive!*

*Bot Name:* ${config.BOT_NAME || 'WHATSAPP BOT'}
*Owner:* ${ownerNumber.map(num => `@${num}`).join(', ')}
*Uptime:* ${hours}h ${minutes}m ${seconds}s

*Prefix:* ${config.PREFIX}
*Platform:* NodeJS
`;
        sms.reply(from, text, m);
    }
}, {
    cmd: ['mp4', 'video'],
    handle: async ({ conn, m, from, sms, args, isUrl, axios }) => {
        if (args.length === 0) {
            return sms.reply(from, `කරුණාකර වීඩියෝවක URL එකක් ලබා දෙන්න. උදා: ${config.PREFIX}mp4 [URL]`, m);
        }

        const videoUrl = args[0];

        if (!isUrl(videoUrl)) {
            return sms.reply(from, 'කරුණාකර වලංගු URL එකක් ලබා දෙන්න.', m);
        }

        sms.reply(from, 'වීඩියෝව බාගත කරමින් පවතී... කරුණාකර මොහොතක් රැඳී සිටින්න.', m);

        try {
            const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            // Send the video
            await conn.sendMessage(from, { video: buffer, caption: 'ඔබ ඉල්ලූ වීඩියෝව.' }, { quoted: m });

        } catch (error) {
            console.error('MP4 Command Error:', error);
            sms.reply(from, 'වීඩියෝව බාගත කිරීමේදී දෝෂයක් ඇති විය. URL එක නිවැරදි දැයි පරීක්ෂා කරන්න.', m);
        }
    }
}, {
    cmd: ['antilink'],
    handle: async ({ conn, m, from, sms, args, isGroup, isGroupAdmins, isOwner, config }) => {
        if (!isGroup) return sms.reply(from, 'මෙම විධානය භාවිතා කළ හැක්කේ Group තුළ පමණි.', m);
        if (!isGroupAdmins && !isOwner) return sms.reply(from, 'මෙම විධානය භාවිතා කිරීමට Group Admin හෝ Bot Owner බලතල අවශ්‍ය වේ.', m);

        if (args[0] === 'on') {
            setAntiLink(from, true);
            sms.reply(from, '*✅ Anti Link* සාර්ථකව *ක්‍රියාත්මක* කරන ලදී.', m);
        } else if (args[0] === 'off') {
            setAntiLink(from, false);
            sms.reply(from, '*❌ Anti Link* සාර්ථකව *අක්‍රිය* කරන ලදී.', m);
        } else {
            const status = getAntiLink(from) ? 'ක්‍රියාත්මකයි (ON)' : 'අක්‍රියයි (OFF)';
            sms.reply(from, \`*Anti Link* තත්ත්වය: \${status}\n\nභාවිතය: \${config.PREFIX}antilink [on/off]\`, m);
        }
    }
}, {
    cmd: ['antibadwords'],
    handle: async ({ conn, m, from, sms, args, isGroup, isGroupAdmins, isOwner, config }) => {
        if (!isGroup) return sms.reply(from, 'මෙම විධානය භාවිතා කළ හැක්කේ Group තුළ පමණි.', m);
        if (!isGroupAdmins && !isOwner) return sms.reply(from, 'මෙම විධානය භාවිතා කිරීමට Group Admin හෝ Bot Owner බලතල අවශ්‍ය වේ.', m);

        if (args[0] === 'on') {
            setAntiBadWords(from, true);
            sms.reply(from, '*✅ Anti Bad Words* සාර්ථකව *ක්‍රියාත්මක* කරන ලදී.', m);
        } else if (args[0] === 'off') {
            setAntiBadWords(from, false);
            sms.reply(from, '*❌ Anti Bad Words* සාර්ථකව *අක්‍රිය* කරන ලදී.', m);
        } else {
            const status = getAntiBadWords(from) ? 'ක්‍රියාත්මකයි (ON)' : 'අක්‍රියයි (OFF)';
            sms.reply(from, \`*Anti Bad Words* තත්ත්වය: \${status}\n\nභාවිතය: \${config.PREFIX}antibadwords [on/off]\`, m);
        }
    }
}, {
    cmd: ['antidelete'],
    handle: async ({ conn, m, from, sms, args, isOwner, config }) => {
        // Anti-Delete යනු Bot Ownerට පමණක් පාලනය කළ හැකි ගෝලීය සැකසුමකි.
        if (!isOwner) return sms.reply(from, 'මෙම විධානය භාවිතා කිරීමට Bot Owner බලතල අවශ්‍ය වේ.', m);

        if (args[0] === 'on') {
            await setAntiDeleteStatus(true);
            sms.reply(from, '*✅ Anti Delete* සාර්ථකව *ක්‍රියාත්මක* කරන ලදී. මෙය Group සහ Inbox දෙකටම අදාළ වේ.', m);
        } else if (args[0] === 'off') {
            await setAntiDeleteStatus(false);
            sms.reply(from, '*❌ Anti Delete* සාර්ථකව *අක්‍රිය* කරන ලදී.', m);
        } else {
            const status = await getAntiDeleteStatus() ? 'ක්‍රියාත්මකයි (ON)' : 'අක්‍රියයි (OFF)';
            sms.reply(from, \`*Anti Delete* තත්ත්වය: \${status}\n\nභාවිතය: \${config.PREFIX}antidelete [on/off]\`, m);
        }
    }
}];
                    
