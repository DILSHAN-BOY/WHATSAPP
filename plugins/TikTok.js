const fetch = require("node-fetch");
const { cmd } = require("../command");
const { readEnv } = require('../lib/database');

cmd({
  pattern: "tiktok",
  alias: ["tiktoks", "tiks"],
  desc: "Search for TikTok videos using a query.",
  react: '◻️',
  category: 'search',
  filename: __filename
}, async (conn, m, store, { from, args, reply, pushname }) => {
  if (!args[0]) {
    return reply(`🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch <query>`);
  }

  const query = args.join(" ");
  await store.react('⌛');

  try {
    // Load dynamic config
    const config = await readEnv();
    const botName = config.BOT_NAME || "AGNI";
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const prefix = config.PREFIX || ".";

    reply(`🔎 Searching TikTok for: *${query}*`);

    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      await store.react('❌');
      return reply("❌ No results found for your query. Please try with a different keyword.");
    }

    const results = data.data.slice(0, 2).sort(() => Math.random() - 0.2);
    const dbResults = [];

    for (const video of results) {
      const message = `🌸 *𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*:\n\n`
        + `*• ꧁༒༺ TITLE ༻༒꧂*: ${video.title}\n`
        + `*• ꧁༒༺ Author ༻༒꧂*: ${video.author || 'Unknown'}\n`
        + `*• ꧁༒༺ Duration ༻༒꧂*: ${video.duration || "Unknown"}\n`
        + `*• ꧁༒༺ URL ༻༒꧂*: ${video.link}\n\n`
        + `> *Bot:* ${botName}\n> *Owner:* ${owner}\n> *Usage:* ${prefix}tiktoksearch <query>`;

      dbResults.push({
        title: video.title,
        author: video.author,
        duration: video.duration,
        link: video.link,
        nowm: video.nowm
      });

      if (video.nowm) {
        await conn.sendMessage(from, {
          video: { url: video.nowm },
          caption: message
        }, { quoted: m });
      } else {
        reply(`❌ Failed to retrieve video for *"${video.title}"*.`);
      }
    }

    // Save to MongoDB
    await TikTokSearch.create({
      botName,
      ownerName: owner,
      query,
      results: dbResults
    });

    await store.react('◻️');

  } catch (error) {
    console.error("Error in TikTokSearch command:", error);
    await store.react('❌');
    reply("❌ An error occurred while searching TikTok. Please try again later.");
  }
});
