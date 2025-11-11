const { readEnv } = require('../lib/database');
const { cmd } = require('../command');
const axios = require('axios');
const { fetchJson } = require('../lib/functions');

const apilink = 'https://nethu-api.vercel.app/news';
let wm = '> *© ᴩᴏᴡᴇʀᴅ ʙʏ shashika dilshan*';
let latestNews = {};
let newsIntervals = {}; // Group-wise news interval storage
let alertEnabledGroups = {}; // Group-wise alert status

const newsSites = [
    { name: "Hiru", url: `${apilink}/hiru` },
    { name: "Derana", url: `${apilink}/derana` },
    { name: "BBC", url: `${apilink}/bbc` },
    { name: "Lankadeepa", url: `${apilink}/lankadeepa` },
    { name: "ITN", url: `${apilink}/itn` },
    { name: "Siyatha", url: `${apilink}/siyatha` },
    { name: "Neth News", url: `${apilink}/nethnews` },
    { name: "LNW", url: `${apilink}/lnw` },
    { name: "Dasatha Lanka", url: `${apilink}/dasathalankanews` },
    { name: "Gossip Lanka", url: `${apilink}/gossiplankanews` }
];

async function checkAndSendNews(conn, from) {
    try {
        for (const site of newsSites) {
            try {
                const news = await fetchJson(site.url);
                if (!news || !news.result || !news.result.title) continue;

                const newTitle = news.result.title;
                if (latestNews[`${from}_${site.name}`] === newTitle) continue;

                latestNews[`${from}_${site.name}`] = newTitle;

                const msg = `*📰 ${news.result.title} (${site.name})*\n\n*${news.result.date}*\n\n${news.result.desc}\n\n${news.result.link || news.result.url}\n\n${wm}`;

                await conn.sendMessage(from, {
                    image: { url: news.result.image || news.result.img || 'https://via.placeholder.com/500' },
                    caption: msg
                });

                // Alert tagging for breaking news
                if (alertEnabledGroups[from]) {
                    const groupMetadata = await conn.groupMetadata(from);
                    const admins = groupMetadata.participants.filter(p => p.admin !== null).map(a => `@${a.id.split('@')[0]}`);
                    const alertMsg = `🚨 *BREAKING NEWS!* 🚨\n\n${msg}\n\n${admins.join(' ')}`;
                    await conn.sendMessage(from, { text: alertMsg, mentions: admins });
                }
            } catch (err) {
                console.error(`❌ Error fetching/sending news from ${site.name} to ${from}:`, err.message);
            }
        }
    } catch (e) {
        console.error("❌ Global error in checkAndSendNews:", e);
    }
}

// Enable Auto News
cmd({
    pattern: "newson",
    alias: ["autonews"],
    react: "🟢",
    desc: "Enable auto news sending",
    category: "group",
    use: '.newson',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    if (newsIntervals[from]) return reply("✅ *Auto News already enabled in this group!*");

    reply("✅ *Auto News enabled for this group.*");

    newsIntervals[from] = setInterval(() => {
        checkAndSendNews(conn, from);
    }, 2 * 60 * 1000); // 2 minutes
});

// Disable Auto News
cmd({
    pattern: "newsoff",
    alias: ["stopnews"],
    react: "🔴",
    desc: "Disable auto news sending",
    category: "group",
    use: '.newsoff',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    if (newsIntervals[from]) {
        clearInterval(newsIntervals[from]);
        delete newsIntervals[from];
        reply("🛑 *Auto News disabled for this group.*");
    } else {
        reply("❌ *Auto News was not enabled in this group!*");
    }
});

// Enable Alerts
cmd({
    pattern: "alerton",
    alias: ["newsalerton"],
    react: "🚨",
    desc: "Enable Breaking News Alerts",
    category: "group",
    use: '.alerton',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    alertEnabledGroups[from] = true;
    reply("✅ *Breaking News Alerts enabled for this group.*");
});

// Disable Alerts
cmd({
    pattern: "alertoff",
    alias: ["newsalertoff"],
    react: "❌",
    desc: "Disable Breaking News Alerts",
    category: "tools",
    use: '.alertoff',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ *This command can only be used in Groups!*");

    alertEnabledGroups[from] = false;
    reply("🛑 *Breaking News Alerts disabled for this group.*");
});



cmd({
    pattern: "news",
    desc: "Get the latest news headlines.",
    category: "tools",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        const apiKey="0f2c43ab11324578a7b1709651736382";
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        const articles = response.data.articles;

        if (!articles.length) return reply("No news articles found.");

        // Send each article as a separate message with image and title
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
            const article = articles[i];
            let message = `
📰 *${article.title}*
⚠️ _${article.description}_
🔗 _${article.url}_

  ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}
            `;

            console.log('Article URL:', article.urlToImage); // Log image URL for debugging

            if (article.urlToImage) {
                // Send image with caption
                await conn.sendMessage(from, { image: { url: article.urlToImage }, caption: message });
            } else {
                // Send text message if no image is available
                await conn.sendMessage(from, { text: message });
            }
        };
    } catch (e) {
        console.error("Error fetching news:", e);
        reply("Could not fetch news. Please try again later.");
    }
});
      
