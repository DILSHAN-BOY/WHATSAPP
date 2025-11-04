const { cmd } = require("../command");

cmd({
  pattern: "newsletter",
  alias: ["cinfo", "cid", "channelinfo"],
  react: "📡",
  desc: "Get WhatsApp Channel info with thumbnail & follow option",
  category: "other",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) {
      return reply(
        "❎ Please provide a WhatsApp Channel link.\n\n*Example:*\n.newsletter https://whatsapp.com/channel/0029VaXYZ12"
      );
    }

    const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
    if (!match)
      return reply(
        "⚠️ *Invalid channel link format.*\n\nUse:\nhttps://whatsapp.com/channel/xxxxxxxxx"
      );

    const inviteCode = match[1];
    const channelId = "invite." + inviteCode;

    let metadata;
    try {
      metadata = await conn.newsletterMetadata(channelId);
    } catch (e) {
      console.error("Fetch error:", e);
      return reply("❌ Failed to fetch channel metadata. Invalid or inaccessible link.");
    }

    if (!metadata || !metadata.id)
      return reply("❌ Channel not found or inaccessible.");

    const followers =
      metadata.subscribers?.toLocaleString() ||
      metadata.subscriber_count?.toLocaleString() ||
      "N/A";

    const infoText =
      `╭───〘 *📡 CHANNEL INFO* 〙───╮\n` +
      `│\n` +
      `│ 🆔 *ID:* ${metadata.id}\n` +
      `│ 📌 *Name:* ${metadata.name || "Unknown"}\n` +
      `│ 👥 *Followers:* ${followers}\n` +
      `│ 📅 *Created:* ${
        metadata.creation_time
          ? new Date(metadata.creation_time * 1000).toLocaleString("en-US")
          : "Unknown"
      }\n` +
      (metadata.description
        ? `│ 📝 *Description:* ${metadata.description}\n`
        : "") +
      `│\n╰───────────────────────╯`;

    const imageUrl =
      metadata.preview_url ||
      (metadata.picture ? `https://pps.whatsapp.net${metadata.picture}` : null);

    // 🧩 Send with Button
    const buttons = [
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "📢 Follow Channel",
          url: `https://whatsapp.com/channel/${inviteCode}`,
        }),
      },
    ];

    if (imageUrl) {
      await conn.sendMessage(
        from,
        {
          image: { url: imageUrl },
          caption: infoText,
          footer: "🔥 Powered by Black Wolf | Shashika",
          templateButtons: buttons,
        },
        { quoted: mek }
      );
    } else {
      await conn.sendMessage(
        from,
        {
          text: infoText,
          footer: "🔥 Powered by Black Wolf | Shashika",
          templateButtons: buttons,
        },
        { quoted: mek }
      );
    }
  } catch (error) {
    console.error("❌ Error in .newsletter plugin:", error);
    reply("⚠️ An unexpected error occurred.");
  }
});
