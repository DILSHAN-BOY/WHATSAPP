const axios = require('axios');
const { cmd } = require('../command');
const yts = require('yt-search');
const fs = require('fs-extra');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions');
const { readEnv } = require('../lib/database');

// =======================
// DEFINE COMMAND
// =======================
cmd({
    pattern: "define",
    desc: "📖 Get the definition of a word",
    react: "🔍",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        if (!q) return reply("Please provide a word to define.\n\n📌 *Usage:* .define [word]");

        const word = q.trim();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        const response = await axios.get(url);
        const definitionData = response.data[0];

        const definition = definitionData.meanings[0].definitions[0].definition;
        const example = definitionData.meanings[0].definitions[0].example || '❌ No example available';
        const synonyms = definitionData.meanings[0].definitions[0].synonyms.join(', ') || '❌ No synonyms available';
        const phonetics = definitionData.phonetics[0]?.text || '🔇 No phonetics available';
        const audio = definitionData.phonetics.find(p => p.audio)?.audio || null;

        const wordInfo = `
📖 *Word*: *${definitionData.word}*
🗣️ *Pronunciation*: _${phonetics}_
📚 *Definition*: ${definition}
✍️ *Example*: ${example}
📝 *Synonyms*: ${synonyms}

🔗 *© ᴩᴏᴡᴇʀᴅ ʙʏ ${botName}*`;

        if (audio) {
            await conn.sendMessage(from, { audio: { url: audio }, mimetype: 'audio/mpeg' }, { quoted: mek });
        }

        return reply(wordInfo);
    } catch (e) {
        console.error("❌ Error in define command:", e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 *Word not found.* Please check the spelling and try again.");
        }
        return reply("⚠️ An error occurred while fetching the definition. Please try again later.");
    }
});

// =======================
// Youtube COMMAND
// =======================
cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    use: '.yts jawad',
    react: "🔎",
    desc: "Search and get details from youtube.",
    category: "search",
    filename: __filename
},
async(conn, mek, m,{from, l, q, reply}) => {
try{
    if (!q) return reply('*Please give me words to search*');

    const arama = await yts(q);
    if (!arama || arama.all.length === 0) {
        return reply('❌ No results found for your search query.');
    }

    let mesaj = '';
    arama.all.forEach((video, index) => {
        mesaj += `*${index + 1}.* 🖲️ *${video.title}*\n🔗 ${video.url}\n\n`;
    });

    await conn.sendMessage(from , { text:  mesaj }, { quoted: mek } );
} catch (e) {
    console.error("❌ Error in yts command:", e);
    reply('⚠️ An error occurred while searching YouTube. Please try again later.');
}
});

cmd({
  pattern: "repo",
  desc: "Fetch information about a GitHub repository.",
  category: "other",
  react: "🍃",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    const repoName = args.join(" ");
    if (!repoName) {
      return reply("❌ Please provide a GitHub repository in the format 📌 `owner/repo`.");
    }

    const apiUrl = `https://api.github.com/repos/${repoName}`;
    const { data } = await axios.get(apiUrl);

    
    let responseMsg = `
╭───〔 📁 GitHub Repository Info 📁 〕───╮
│
│ 📌 Name: ${data.name}
│ 🔗 URL: ${data.html_url}
│ 📝 Description: ${data.description || "No description"}
│ ⭐ Stars: ${data.stargazers_count}
│ 🍴 Forks: ${data.forks_count}
│ 👤 Owner: ${data.owner.login}
│ 📅 Created At: ${new Date(data.created_at).toLocaleDateString()}
│
╰───────────────────────────────╯
*© ᴩᴏᴡᴇʀᴅ ʙʏ ${botName}*`;

    await conn.sendMessage(from, { text: responseMsg }, { quoted: m });
  } catch (error) {
    console.error("GitHub API Error:", error);
    reply(`❌ Error fetching repository data: ${error.response?.data?.message || error.message}`);
  }
});

cmd({
  pattern: "xuser",
  alias: ["twitterstalk", "twtstalk"],
  desc: "Get details about a Twitter/X user.",
  react: "🔍",
  category: "search",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    if (!q) {
      return reply("❌ Please provide a valid Twitter/X username.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/xstalk?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.status || !data.data) {
      return reply("⚠️ Failed to fetch Twitter/X user details. Ensure the username is correct.");
    }

    const user = data.data;
    const verifiedBadge = user.verified ? "✅" : "❌";

    const caption = `
╔═════════════════════╗
║       🐦 TWITTER/X STALKER 🐦
╠═════════════════════╣
║ 👤 Name       : ${user.name}
║ 🔹 Username   : @${user.username}
║ ✔️ Verified   : ${verifiedBadge}
║ 👥 Followers  : ${user.followers_count}
║ 👤 Following  : ${user.following_count}
║ 📝 Tweets     : ${user.tweets_count}
║ 📅 Joined     : ${user.created}
║ 🔗 Profile    : [Click Here](${user.url})
╚═════════════════════╝

✨ Powered BY ${botName}
`;

    await conn.sendMessage(from, {
      image: { url: user.avatar },
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});



cmd({
  pattern: "tiktokuser",
  alias: ["tstalk", "ttstalk"],
  react: "📱",
  desc: "Fetch TikTok user profile details.",
  category: "search",
  filename: __filename
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    if (!q) {
      return reply("❎ Please provide a TikTok username.\n\n*Example:* .tiktokstalk mrbeast");
    }

    const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) {
      return reply("❌ User not found. Please check the username and try again.");
    }

    const user = data.data.user;
    const stats = data.data.stats;

    const profileInfo = `
╔════════════════════════╗
║     🎭 TikTok USER 🎭
╠════════════════════════╣
║ 👤 Username    : @${user.uniqueId}
║ 📛 Nickname    : ${user.nickname}
║ ✅ Verified    : ${user.verified ? "Yes ✅" : "No ❌"}
║ 📍 Region      : ${user.region}
║ 📝 Bio         : ${user.signature || "No bio available."}
║ 🔗 Bio Link    : ${user.bioLink?.link || "No link available."}
╠════════════════════════╣
║ 📊 Statistics
║ 👥 Followers   : ${stats.followerCount.toLocaleString()}
║ 👤 Following   : ${stats.followingCount.toLocaleString()}
║ ❤️ Likes       : ${stats.heartCount.toLocaleString()}
║ 🎥 Videos      : ${stats.videoCount.toLocaleString()}
╠════════════════════════╣
║ 📅 Created      : ${new Date(user.createTime * 1000).toLocaleDateString()}
║ 🔒 Private      : ${user.privateAccount ? "Yes 🔒" : "No 🌍"}
║ 🔗 Profile URL  : https://www.tiktok.com/@${user.uniqueId}
╚════════════════════════╝
✨ Powered BY ${botName}
`;

    const profileImage = { image: { url: user.avatarLarger }, caption: profileInfo };

    await conn.sendMessage(from, profileImage, { quoted: m });
  } catch (error) {
    console.error("❌ Error in TikTok stalk command:", error);
    reply("⚠️ An error occurred while fetching TikTok profile data.");
  }
});


cmd({
  pattern: "spotifysearch",
  alias: ["spotifysrch", "spsearch"],
  desc: "Search for Spotify tracks using a query.",
  react: '✅',
  category: 'search',
  filename: __filename
}, async (conn, m, store, {
  from,
  args,
  reply
}) => {
  if (!args[0]) {
    return reply("♻️search on Spotify?\n\n*Usage Example:*\n.spotifysearch <query>");
  }

  const query = args.join(" ");
  await store.react('⌛');

  try {
    reply(`🔎 Searching Spotify for: *${query}*`);

    const response = await fetch(`https://apis-keith.vercel.app/search/spotify?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data || !data.status || !data.result || data.result.length === 0) {
      await store.react('❌');
      return reply("❌ No results found for your query. Please try with a different keyword.");
    }

    // Get up to 7 random results
    const results = data.result.slice(0, 7).sort(() => Math.random() - 0.5);

    for (const track of results) {
      const message = `
╔═════════════════════╗
║     🎶 Spotify Track 🎶
╠═════════════════════╣
║ • Title        : ${track.title}
║ • Artist       : ${track.artist}
║ • Album        : ${track.album}
║ • Duration     : ${track.duration.formatted}
║ • Release Date : ${track.releaseDate}
║ • URL          : ${track.url}
╚═════════════════════╝
`;

      reply(message);
    }

    await store.react('✅');
  } catch (error) {
    console.error("Error in SpotifySearch command:", error);
    await store.react('❌');
    reply("❌ An error occurred while searching Spotify. Please try again later.");
  }
});
  
