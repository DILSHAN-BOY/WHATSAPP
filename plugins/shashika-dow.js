"use strict";

//█▀ █░█ ▄▀█ █▀ █░█ █ █▄▀ ▄▀█   █▀▄ █ █░░ █▀ █░█ ▄▀█ █▄░█  
//▄█ █▀█ █▀█ ▄█ █▀█ █ █░█ █▀█   █▄▀ █ █▄▄ ▄█ █▀█ █▀█ █░▀█  

const axios = require("axios").create({
  timeout: 25000,
  maxRedirects: 5,
});
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const { cmd } = require("../command");
const { fetchJson } = require("../lib/functions");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { readEnv } = require('../lib/database');
const API_URL = "https://facebook-downloader.apis-bj-devs.workers.dev/"; // Current API URL
const api = `https://nethu-api-ashy.vercel.app`;

// Helpers
const isHttpUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u || "");
const safe = (v, d = null) => (v === undefined || v === null ? d : v);

cmd(
  {
    pattern: "fb1",
    alias: ["facebook"],
    react: "🎬",
    category: "download",
    desc: "Download Facebook videos (HD or SD) with thumbnail and extra info",
    filename: __filename,
  },
  async (
    robin,
    m,
    mek,
    { from, q, reply }
  ) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
      console.log("Received Facebook URL:", q);

      if (!q || q.trim() === "") {
        console.log("No URL provided by user");
        return await reply("*🎬 Please provide a valid Facebook video URL!* ⚡");
      }

      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb|m\.facebook|fb\.watch)\.com\/(?:(?:share|videos|watch|video|reel|post|live|stories|groups)\/.+|(?:u\/\d+|user\/\d+|profile\.php\?id=\d+)|(?:photo\.php\?fbid=\d+)|(?:permalink\.php\?story_fbid=\d+&id=\d+))+/i;
      if (!fbRegex.test(q)) {
        console.log("Invalid Facebook URL provided:", q);
        return await reply("*❌ Invalid Facebook URL! Please provide a valid link (e.g., facebook.com/videos, fb.watch, facebook.com/share, etc.).* ❄️");
      }

      await reply("*⏳ Fetching video details, please wait...* ❄️");

      const apiUrl = `${API_URL}?url=${encodeURIComponent(q)}`;
      console.log("API Request URL:", apiUrl);

      const response = await axios.get(apiUrl, { timeout: 15000 });

      console.log("API Response:", JSON.stringify(response.data, null, 2));

      if (!response.data) {
        console.log("No API response received");
        return await reply("*❌ No response from API. The service might be down. Try again later.* 🌿");
      }

      const apiStatus = response.data.status === true;

      if (!apiStatus) {
        console.log("API reported failure, Response:", response.data);
        let errorMsg = "*❌ Failed to fetch video details.* 🌼";
        if (response.data.message) {
          errorMsg += `\nReason: ${response.data.message}`;
        } else {
          errorMsg += "\nThe video might be private, restricted, or the URL is invalid. Please check the URL and try again.";
        }
        return await reply(errorMsg);
      }

      const videoData = {
  ...response.data.data,
  poweredBy: `*${botName}*`,
  status: apiStatus
};

      console.log("Video Data:", JSON.stringify(videoData, null, 2));

      if (videoData.url) {
        console.log("Single video found, URL:", videoData.url);

        let caption = `*🎬 Facebook Video*\n`;
        let videoUrlToSend = videoData.url; // Default to HD or available quality

        // Check if SD quality is available (assuming API might return multiple qualities)
        if (videoData.qualities && Array.isArray(videoData.qualities)) {
          const sdQuality = videoData.qualities.find(q => q.quality === "SD");
          if (sdQuality && sdQuality.url) {
            videoUrlToSend = sdQuality.url; // Use SD if available
            caption += `🌩️ Quality: SD\n`;
          } else if (videoData.quality) {
            caption += `🌩️Quality: ${videoData.quality}\n`;
          }
        } else if (videoData.quality) {
          caption += `🌩️ Quality: ${videoData.quality}\n`;
        }

        //caption: `*${botName}*`,

        if (videoData.thumbnail) {
          await robin.sendMessage(
            from,
            {
              image: { url: videoData.thumbnail },
              caption: "*🎬 Facebook Video Thumbnail*\n⏳ Video will be sent next...* ®",
            },
            { quoted: mek }
          );
        }

        await robin.sendMessage(
          from,
          {
            video: { url: videoUrlToSend },
            caption: caption,
          },
          { quoted: mek }
        );
      } else {
        console.log("No video URL found in response:", response.data);
        return await reply("*❌ No video URL found in the response. The video might be private or not available.* 🌼");
      }

    } catch (e) {
      console.error("Error downloading FB video:", e.message, e.stack);
      if (e.code === "ECONNABORTED") {
        return await reply("*❌ Timeout: The server took too long to respond. Please try again later.* 🌼");
      } else if (e.response && e.response.data) {
        return await reply(`*❌ Error:* ${e.response.data.message || "API error occurred. Try again later."} 🌼`);
      } else {
        return await reply(`*❌ Error:* ${e.message || "Something went wrong while downloading the video. Try again later."} 🌼`);
      }
    }
  }
);

// Handle button response (removed since we are handling single video directly now)
cmd(
  {
    pattern: "fb_quality",
    dontAddCommandList: true, // Hide from command list
  },
  async (
    robin,
    mek,
    m,
    { from, reply }
  ) => {
    try {
      console.log("Button interaction received for user:", m.sender, "Button ID:", m.id);
      await reply("*❌ This command is no longer needed. Use !fb directly with the video URL.* 🌿");

    } catch (e) {
      console.error("Error in fb_quality command:", e.message, e.stack);
      await reply("*❌ Error processing your request. Please try again.* 🌿");
    }
  }
);

/* ======================= FACEBOOK DOWNLOADER ======================= */
cmd(
  {
    pattern: "facebook",
    react: "🎥",
    alias: ["fbb", "fbvideo", "fb"],
    desc: "Download videos from Facebook",
    category: "download",
    use: ".facebook <facebook_url>",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
      if (!isHttpUrl(q)) return reply("give me a valid Facebook URL.");

      const fb = await fetchJson(
        `${api}/download/fbdown?url=${encodeURIComponent(q)}`
      ).catch(() => null);

      const res = fb?.result || {};
      const sd = res.sd;
      const hd = res.hd;
      const thumb = res.thumb;

      if (!sd && !hd) return reply("I couldn't find anything :(");

      const caption = `*${botName}*\n\n📝 Title : Facebook video\n🔗 URL : ${q}`;
      if (thumb && isHttpUrl(thumb)) {
        await conn.sendMessage(
          from,
          { image: { url: thumb }, caption },
          { quoted: mek }
        );
      }

      if (sd && isHttpUrl(sd)) {
        await conn.sendMessage(
          from,
          { video: { url: sd }, mimetype: "video/mp4", caption: `*SD-Quality*` },
          { quoted: mek }
        );
      }

      if (hd && isHttpUrl(hd)) {
        await conn.sendMessage(
          from,
          { video: { url: hd }, mimetype: "video/mp4", caption: `*HD-Quality*` },
          { quoted: mek }
        );
      }
    } catch (err) {
      console.error("facebook:", err);
      reply("*ERROR*");
    }
  }
);

/* ======================= TIKTOK DOWNLOADER ======================= */
cmd(
  {
    pattern: "tiktok",
    react: "📱",
    desc: "Download TikTok Video (No Watermark)",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
      if (!q) return reply("Ex: `.tiktok https://vm.tiktok.com/XYZ123`");
      if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok URL.");

      const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(q)}`;
      const { data: result } = await axios.get(API_URL);

      if (result.code !== 0 || !result.data?.play) {
        return reply("❌ Couldn't fetch video. Try again later.");
      }

      const videoUrl = result.data.play;
      const title = result.data.title || "TikTok Video";
      const author = result.data.author?.nickname || "Unknown";

      const caption =
        `*🪄 ${botName} TIKTOK DOWNLOADER 🪄*\n\n` +
        `🎥 *Title*: ${title}\n` +
        `👤 *Author*: ${author}\n` +
        `🔗 *URL*: ${q}\n\n` +
        `> *powered by ${owner}*`;

      await conn.sendMessage(
        from,
        { video: { url: videoUrl }, caption, mimetype: "video/mp4" },
        { quoted: mek }
      );
    } catch (e) {
      console.error("tiktok:", e);
      reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

cmd(
  {
    pattern: "tiktokwm",
    react: "💦",
    desc: "Download TikTok Video (With Watermark)",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("Ex: `.tiktokwm https://vm.tiktok.com/XYZ123`");
      if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok URL.");

      const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(q)}`;
      const { data: result } = await axios.get(API_URL);

      if (result.code !== 0 || !result.data?.wmplay) {
        return reply("❌ Couldn't fetch watermarked video.");
      }

      await conn.sendMessage(
        from,
        {
          video: { url: result.data.wmplay },
          caption: `*🫦 TikTok Watermarked Video 🫦*\n👤 Author: ${safe(
            result.data.author?.nickname,
            "Unknown"
          )}`,
          mimetype: "video/mp4",
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("tiktokwm:", e);
      reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

cmd(
  {
    pattern: "tiktokaudio",
    react: "🎵",
    desc: "Download TikTok Audio",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("Ex: `.tiktokaudio https://vm.tiktok.com/XYZ123`");
      if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok URL.");

      const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(q)}`;
      const { data: result } = await axios.get(API_URL);

      if (result.code !== 0 || !result.data?.music) {
        return reply("❌ Couldn't fetch TikTok audio.");
      }

      const title = result.data.music_info?.title || "TikTok Audio";
      const author =
        result.data.music_info?.author ||
        result.data.author?.nickname ||
        "Unknown";

      await conn.sendMessage(
        from,
        {
          audio: { url: result.data.music },
          mimetype: "audio/mp4",
          fileName: `${title.replace(/[^\w\s]/gi, "")}.mp3`,
          caption: `*🎵 TikTok Audio 🎵*\n🎵 Title: ${title}\n👤 Artist: ${author}`,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("tiktokaudio:", e);
      reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

/* ======================= YOUTUBE POST ======================= */
cmd(
  {
    pattern: "ytpost",
    alias: ["ytcommunity", "ytc"],
    desc: "Download a YouTube community post",
    category: "downloader",
    react: "🎥",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q))
        return reply("Please provide a valid YouTube community post URL.");

      const { data } = await axios.get(
        `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(q)}`
      );

      if (!data?.status || !data?.data) {
        return reply("Failed to fetch the community post.");
      }

      const post = data.data;
      let caption = `༒ *YouTube Community Post* ⌲\n\n📜 *Content:* ${safe(
        post?.content,
        "-"
      )}`;

      const imgs = Array.isArray(post?.images) ? post.images : [];
      if (imgs.length > 0) {
        for (const img of imgs) {
          if (!isHttpUrl(img)) continue;
          await conn.sendMessage(
            from,
            { image: { url: img }, caption },
            { quoted: mek }
          );
          caption = "";
        }
      } else {
        await conn.sendMessage(from, { text: caption }, { quoted: mek });
      }
    } catch (e) {
      console.error("ytpost:", e);
      reply("❌ Error fetching the YouTube community post.");
    }
  }
);

/* ======================= APK DOWNLOADER ======================= */
cmd(
  {
    pattern: "apk",
    desc: "Download APK from Aptoide.",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("❌ Please provide an app name.");

      const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(
        q
      )}/limit=1`;
      const { data } = await axios.get(apiUrl);

      const list = data?.datalist?.list;
      if (!Array.isArray(list) || list.length === 0) {
        return reply("⚠️ No results found.");
      }

      const app = list[0];
      const appSize = app?.size ? (app.size / 1048576).toFixed(2) : "N/A";
      const apkUrl = app?.file?.path_alt || app?.file?.path;

      if (!isHttpUrl(apkUrl)) return reply("⚠️ APK file not available.");

      const caption = `🍃 *Name:* ${safe(app?.name, "-")}\n🍁 *Size:* ${appSize} MB\n📦 *Package:* ${safe(
        app?.package,
        "-"
      )}`;

      if (isHttpUrl(app?.icon)) {
        await conn.sendMessage(
          from,
          { image: { url: app.icon }, caption },
          { quoted: mek }
        );
      } else {
        await reply(caption);
      }

      await conn.sendMessage(
        from,
        {
          document: {
            url: apkUrl,
            fileName: `${safe(app?.name, "app")}.apk`,
            mimetype: "application/vnd.android.package-archive",
          },
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("apk:", e);
      reply("❌ Error fetching APK.");
    }
  }
);

/* ======================= GOOGLE DRIVE ======================= */
cmd(
  {
    pattern: "gdrive",
    desc: "Download Google Drive files.",
    react: "🌐",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q)) return reply("❌ Please provide a valid Drive link.");

      const { data } = await axios.get(
        `https://api.fgmods.xyz/api/downloader/gdrive?url=${encodeURIComponent(
          q
        )}&apikey=mnp3grlZ`
      );

      const dl = data?.result;
      if (!isHttpUrl(dl?.downloadUrl)) {
        return reply("⚠️ No download URL found.");
      }

      await conn.sendMessage(
        from,
        {
          document: {
            url: dl.downloadUrl,
            mimetype: safe(dl.mimetype, "application/octet-stream"),
            fileName: safe(dl.fileName, "gdrive_file"),
          },
          caption: `*${botName}*`,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("gdrive:", e);
      reply("❌ Error fetching Drive file.");
    }
  }
);

/* ======================= GITHUB ======================= */
cmd(
  {
    pattern: "gitclone",
    alias: ["git", "getrepo"],
    desc: "Download GitHub repo as zip.",
    react: "📦",
    category: "downloader",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply }) => {
    try {
      const link = args?.[0];
      if (!/^https?:\/\/github\.com\/.+/i.test(link || "")) {
        return reply("⚠️ Invalid GitHub link.");
      }

      const match = link.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git|\/|$)/i);
      if (!match) return reply("⚠️ Invalid GitHub URL.");

      const [, username, repo] = match;
      const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

      const head = await axios.head(zipUrl).catch(() => ({ headers: {} }));
      const cd =
        head?.headers?.["content-disposition"] ||
        head?.headers?.["Content-Disposition"];
      const fileName =
        (cd && (cd.match(/filename="?([^"]+)"?/) || [])[1]) || `${repo}.zip`;

      await conn.sendMessage(
        from,
        {
          document: { url: zipUrl },
          fileName,
          mimetype: "application/zip",
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("gitclone:", e);
      reply("❌ Failed to download repository.");
    }
  }
);

/* ======================= MEDIAFIRE ======================= */
cmd(
  {
    pattern: "mediafire",
    alias: ["mfire"],
    desc: "Download Mediafire files",
    category: "download",
    react: "📩",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q || !q.startsWith("https://")) {
        return reply("❌ Please provide a valid Mediafire URL.");
      }

      const { data: html } = await axios.get(q);
      const $ = cheerio.load(html);

      const fileName = $(".dl-info > div > div.filename").text().trim();
      const downloadUrl = $("#downloadButton").attr("href");
      const fileType = $(".dl-info > div > div.filetype").text().trim();
      const fileSize = $(".dl-info ul li:nth-child(1) > span").text().trim();
      const fileDate = $(".dl-info ul li:nth-child(2) > span").text().trim();

      if (!fileName || !downloadUrl) {
        return reply("⚠️ Failed to extract Mediafire info.");
      }

      let mimeType = "application/octet-stream";
      const ext = fileName.split(".").pop().toLowerCase();
      const mimeTypes = {
        zip: "application/zip",
        pdf: "application/pdf",
        mp4: "video/mp4",
        mkv: "video/x-matroska",
        mp3: "audio/mpeg",
        "7z": "application/x-7z-compressed",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        rar: "application/x-rar-compressed",
      };
      if (mimeTypes[ext]) mimeType = mimeTypes[ext];

      await conn.sendMessage(
        from,
        {
          document: { url: downloadUrl },
          fileName,
          mimetype: mimeType,
          caption: `📄 *${fileName}*\n📁 Type: ${fileType}\n📦 Size: ${fileSize}\n📅 Uploaded: ${fileDate}`,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("mediafire:", e);
      reply("❌ Error while processing Mediafire link.");
    }
  }
);

/* ======================= GOOGLE IMAGE ======================= */
cmd({
  pattern: "img",
  alias: ["aiimg3", "bingimage"],
  desc: "Search for images using Bing and send 5 results.",
  category: "tools",
  react: "📷",
  use: ".img <query>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const query = args.join(" ");
    if (!query) {
      return reply("❌ Please provide a search query. Example: `.img dog`");
    }

    // Fetch images from the Bing Image Search API
    const response = await axios.get(`https://api.siputzx.my.id/api/s/bimg?query=${encodeURIComponent(query)}`);
    const { status, data } = response.data;

    if (!status || !data || data.length === 0) {
      return reply("❌ No images found for the specified query. Please try again.");
    }

    // Select the first 5 images
    const images = data.slice(0, 5);

    // Send each image as an attachment
    for (const imageUrl of images) {
      await conn.sendMessage(from, {
        image: { url: imageUrl }, // Attach the image
        caption: `🔍 *Google Image Search*: ${query}`,
      });
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    reply("❌ Unable to fetch images. Please try again later.");
  }
});

//==============

cmd({
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks"],
  desc: "Search for TikTok videos using a query.",
  react: '✅',
  category: 'download',
  filename: __filename
}, async (conn, m, store, {
  from,
  args,
  reply
}) => {
  if (!args[0]) {
    return reply("🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch <query>");
  }

  const query = args.join(" ");
  await store.react('⌛');

  try {
    reply(`🔎 Searching TikTok for: *${query}*`);
    
    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      await store.react('❌');
      return reply("❌ No results found for your query. Please try with a different keyword.");
    }

    // Get up to 7 random results
    const results = data.data.slice(0, 7).sort(() => Math.random() - 0.5);

    for (const video of results) {
      const message = `
╔════════════════════╗
║      🎵 TIKTOK VIDEO 🎵
╚════════════════════╝

🎬 *Title:* ${video.title}
👤 *Author:* ${video.author || 'Unknown'}
⏱️ *Duration:* ${video.duration || "Unknown"}
🔗 *URL:* ${video.link}

╭────────────────────╮
│ ✦ Enjoy your video! 
╰────────────────────╯
`.trim();

      if (video.nowm) {
        await conn.sendMessage(from, {
          video: { url: video.nowm },
          caption: message
        }, { quoted: m });
      } else {
        reply(`❌ Failed to retrieve video for *"${video.title}"*.`);
      }
    }

    await store.react('✅');
  } catch (error) {
    console.error("Error in TikTokSearch command:", error);
    await store.react('❌');
    reply("❌ An error occurred while searching TikTok. Please try again later.");
  }
});
  
cmd({
    pattern: "ytpost",
    alias: ["ytcommunity", "ytc"],
    desc: "Download a YouTube community post",
    category: "download",
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a YouTube community post URL.\nExample: `.ytpost <url>`");

        const apiUrl = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            await react("❌");
            return reply("Failed to fetch the community post. Please check the URL.");
        }

        const post = data.data;
        let caption = `📢 *YouTube Community Post* 📢\n\n` +
                      `📜 *Content:* ${post.content}`;

        if (post.images && post.images.length > 0) {
            for (const img of post.images) {
                await conn.sendMessage(from, { image: { url: img }, caption }, { quoted: mek });
                caption = ""; // Only add caption once, images follow
            }
        } else {
            await conn.sendMessage(from, { text: caption }, { quoted: mek });
        }

        await react("✅");
    } catch (e) {
        console.error("Error in ytpost command:", e);
        await react("❌");
        reply("An error occurred while fetching the YouTube community post.");
    }
});

cmd({
  pattern: "ig2",
  alias: ["insta2", "Instagram2"],
  desc: "To download Instagram videos.",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Instagram link.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${q}`);
    const data = response.data;

    if (!data || data.status !== 200 || !data.downloadUrl) {
      return reply("⚠️ Failed to fetch Instagram video. Please check the link and try again.");
    }

    await conn.sendMessage(from, {
      video: { url: data.downloadUrl },
      mimetype: "video/mp4",
      caption: "📥 *Instagram Video Downloaded Successfully!*"
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});


// twitter-dl

cmd({
  pattern: "twitter",
  alias: ["tweet", "twdl"],
  desc: "Download Twitter videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Twitter URL." }, { quoted: m });
    }

    await conn.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    });

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/twitter?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return reply("⚠️ Failed to retrieve Twitter video. Please check the link and try again.");
    }

    const { desc, thumb, video_sd, video_hd } = data.result;

    const caption = `
╔═══════════════════════╗
║     🐦 *${botName}* 🐦
║    ⌬ TWITTER DOWNLOADER ⌬
╚═══════════════════════╝

📄 *Description:* ${desc || "No description"}

╭───────────────•✧•───────────────╮
│ 📹 *Download Options:*
│ 1️⃣  SD Quality
│ 2️⃣  HD Quality
│
│ 🎵 *Audio Options:*
│ 3️⃣  Audio
│ 4️⃣  Document
│ 5️⃣  Voice
╰───────────────•✧•───────────────╯

📌 *Reply with the number to download your choice.*
`;
    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumb },
      caption: caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, {
          react: { text: '⬇️', key: receivedMsg.key }
        });

        switch (receivedText) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: video_sd },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: video_hd },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "3":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
            break;

          case "4":
            await conn.sendMessage(senderID, {
              document: { url: video_sd },
              mimetype: "audio/mpeg",
              fileName: "Twitter_Audio.mp3",
              caption: "📥 *Audio Downloaded as Document*"
            }, { quoted: receivedMsg });
            break;

          case "5":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, 4, or 5.");
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});

cmd({
    pattern: "pindl",
    alias: ["pinterestdl", "pin", "pins", "pindownload"],
    desc: "Download media from Pinterest",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { args, quoted, from, reply }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        // Make sure the user provided the Pinterest URL
        if (args.length < 1) {
            return reply('❎ Please provide the Pinterest URL to download from.');
        }

        // Extract Pinterest URL from the arguments
        const pinterestUrl = args[0];

        // Call your Pinterest download API
        const response = await axios.get(`https://api.giftedtech.web.id/api/download/pinterestdl?apikey=gifted&url=${encodeURIComponent(pinterestUrl)}`);

        if (!response.data.success) {
            return reply('❎ Failed to fetch data from Pinterest.');
        }

        const media = response.data.result.media;
        const description = response.data.result.description || 'No description available'; // Check if description exists
        const title = response.data.result.title || 'No title available';

        // Select the best video quality or you can choose based on size or type
        const videoUrl = media.find(item => item.type.includes('720p'))?.download_url || media[0].download_url;

        // Prepare the new message with the updated caption
        const desc = `
╔═══════════════════════════╗
║       💠 *${botName}* 💠
║    ⌬ PINS DOWNLOADER ⌬
╚═══════════════════════════╝

╭───────────────•✧•───────────────╮
│ ✦ *Title:* ${title}
│ ✦ *Media Type:* ${media[0].type}
╰───────────────•✧•───────────────╯

╔═══════════════════════════╗
║      ❝ Powered with ❤️ by ${botName} ❞
╚═══════════════════════════╝
`;

        // Send the media (video or image) to the user
        if (videoUrl) {
            // If it's a video, send the video
            await conn.sendMessage(from, { video: { url: videoUrl }, caption: desc }, { quoted: mek });
        } else {
            // If it's an image, send the image
            const imageUrl = media.find(item => item.type === 'Thumbnail')?.download_url;
            await conn.sendMessage(from, { image: { url: imageUrl }, caption: desc }, { quoted: mek });
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('❎ An error occurred while processing your request.');
    }
});

cmd({
    pattern: "sptdl",
    alias: ["spotifydl", "spotidown"],
    desc: "Download Spotify music as MP3",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, pushname }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        if (!q) return reply("*Please provide a Spotify link.*");
        if (!q.includes("spotify.com")) return reply("*Invalid Spotify link provided.*");

        reply("⏳ *Fetching Spotify track... Please wait!*");

        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/spotify`, {
            params: { url: q }
        });

        if (!data.status || !data.data) return reply("*Failed to fetch Spotify track. Please try again later.*");

        const {
            title,
            type,
            artis,
            durasi,
            image,
            download
        } = data.data;

        // Convert duration from milliseconds to MM:SS format
        const durationSec = Math.floor(durasi / 1000);
        const minutes = Math.floor(durationSec / 60).toString().padStart(2, '0');
        const seconds = (durationSec % 60).toString().padStart(2, '0');
        const duration = `${minutes}:${seconds}`;

        
    const caption = `
╔═══════════════════════╗
║      🎵 SPOTIFY DOWNLOADER 🎵
╚═══════════════════════╝

🎼 *Title:* ${title}
🧑‍🎤 *Artist:* ${artis}
🎶 *Type:* ${type}
⏱️ *Duration:* ${duration}

╭─────────────────────────╮
│ ✦ DOWNLOADED BY: ${botName}
╰─────────────────────────╯
`.trim();

        // Send cover image with track info
        await conn.sendMessage(from, {
            image: { url: image },
            caption: caption
        }, { quoted: mek });

        // Send the MP3 file
        await conn.sendMessage(from, {
            audio: { url: download },
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: mek });

    } catch (e) {
        console.error("Spotify Download Error:", e);
        reply("*Oops! An error occurred while downloading the Spotify track.*");
    }
});
cmd({
  pattern: "wall",
  alias: ["randomw", "wallpaper"],
  react: "🖼",
  desc: "Download random wallpapers based on keywords.",
  category: "wallpapers",
  use: ".rw <keyword>",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const query = args.join(" ") || "random";
    const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;

    const { data } = await axios.get(apiUrl);

    if (data.status && data.imgUrl) {
      const caption = `
╔════════════════════════╗
║      🖼️ WALLPAPER 🖼️
╚════════════════════════╝

🎯 *Query:* ${query || "No query provided"}
⚡ *For more updates, follow our channel!*

╭────────────────────────╮
│ ✦ Enjoy your wallpaper!
╰────────────────────────╯
`;

      await conn.sendMessage(from, {
        image: { url: data.imgUrl },
        caption,
        ...newsletterContext
      }, { quoted: quotedContact });

    } else {
      reply(`❌ No wallpaper found for *"${query}"*.`);
    }
  } catch (error) {
    console.error("Wallpaper Error:", error);
    reply("❌ An error occurred while fetching the wallpaper. Please try again.");
  }
});


const apilink = "https://darkyasiya-new-movie-api.vercel.app/";
const apikey = '';
const oce = '`';

function formatNumber(num) {
    return String(num).padStart(2, '0');
}

cmd({
    pattern: "hub",
    alias: ["ph"],
    react: "🔞",
    desc: "Download Pornhub video",
    category: "download",
    use: ".ph < query >",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        if (!q) return await reply("Query need ?");

        const searchRes = (await axios.get(`${apilink}/api/other/pornhub/search?q=${q}&apikey=${apikey}`)).data;
        const response = searchRes?.data;

        if (!response || response.length === 0) return await reply("Result not found: " + q);

        let info = `\`PORNHUB DOWNLOADER\`\n\n`;
        for (let v = 0; v < response.length; v++) {
            info += `*${formatNumber(v + 1)} ||* ${response[v].title}\n`;
        }
        info += `\n${config.BOT_NAME}`;

        const sentMsg = await conn.sendMessage(from, {
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: "PORNHUB DOWNLOADER",
                    body: "",
                    thumbnailUrl: config.LOGO,
                    mediaType: 1,
                    sourceUrl: q
                }
            }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        const handler = async (messageUpdate) => {
            const mekInfo = messageUpdate?.messages?.[0];
            if (!mekInfo?.message) return;

            const messageText = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReplyToSentMsg) return;

            conn.ev.off('messages.upsert', handler); // remove listener after one response

            try {
                let selectedIndex = parseInt(messageText.trim()) - 1;

                if (selectedIndex >= 0 && selectedIndex < response.length) {
                    const selectVid = response[selectedIndex];
                    await conn.sendMessage(from, { react: { text: '🔌', key: mekInfo.key } });

                    const videoRes = await axios.get(`${apilink}/api/other/pornhub/download?url=${selectVid.videoUrl}&apikey=${apikey}`);
                    const data = videoRes.data?.data;

                    if (!data || !data.videos || data.videos.length === 0) return reply(`*Download link not found. ❌*`);

                    let s_m_g = '';
                    for (let l = 0; l < data.videos.length; l++) {
                        s_m_g += `${formatNumber(l + 1)} || Download ${data.videos[l].quality.split("-")[0].trim()} Quality\n\n`;
                    }

                    let mg = `╭─────────────────────╮\n` +
                        `│ 🔞 *P HUB DOWNLOADER* 🔞 \n` +
                        `├─────────────────────┤\n` +
                        `│ 📜 ${oce}Title:${oce} *${data.title}*\n` +
                        `│\n` +
                        `│ 🗣️ ${oce}Input:${oce} *${q}*\n` +
                        `╰─────────────────────╯\n\n` +
                        `${s_m_g}`;

                    const mass = await conn.sendMessage(from, {
                        image: { url: data.cover},
                        caption: mg
                    }, { quoted: mekInfo });

                    const messageID2 = mass.key.id;

                    const handler2 = async (update2) => {
                        const replyMsg = update2?.messages?.[0];
                        if (!replyMsg?.message) return;

                        const msgTxt = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
                        const isReplyToSecond = replyMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID2;

                        if (!isReplyToSecond) return;

                        conn.ev.off('messages.upsert', handler2); // remove second listener

                        try {
                            let selected = parseInt(msgTxt.trim()) - 1;
                            if (selected >= 0 && selected < data.videos.length) {
                                const selectedVideo = data.videos[selected];

                                await conn.sendMessage(from, {
                                    react: { text: '⬇️', key: replyMsg.key }
                                });

                                await conn.sendMessage(from, {
                                    document: { url: selectedVideo.url },
                                    mimetype: "video/mp4",
                                    fileName: `${data.title}.mp4`,
                                    caption: `${data.title}`
                                }, { quoted: replyMsg });

                                await conn.sendMessage(from, {
                                    react: { text: '✅', key: replyMsg.key }
                                });

                            } else {
                                await conn.sendMessage(from, {
                                    text: `Invalid selection. Use 01 - ${data.videos.length}`,
                                    quoted: replyMsg
                                });
                            }
                        } catch (e) {
                            console.log(e);
                            await conn.sendMessage(from, { text: "Error !!" }, { quoted: replyMsg });
                        }
                    };

                    conn.ev.on('messages.upsert', handler2);

                } else {
                    return await conn.sendMessage(from, {
                        text: `Invalid selection. Use 01 - ${response.length}`,
                        quoted: mekInfo
                    });
                }

            } catch (e) {
                console.log(e);
                await conn.sendMessage(from, { text: "Error !!" }, { quoted: mekInfo });
            }
        };

        conn.ev.on('messages.upsert', handler);

    } catch (e) {
        console.log(e);
        await reply("Error !!");
    }
});
                                                                   
