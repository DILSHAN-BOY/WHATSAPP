const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

// Stylish character map
const stylizedChars = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
  '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

//===============================
// 🔤 CHR Command
//===============================
cmd({
  pattern: "chr",
  alias: ["creact"],
  react: "🔤",
  desc: "React to WhatsApp Channel messages with stylized text",
  category: "owner",
  use: ".chr <channel-link> <text>",
  filename: __filename
}, 
async (conn, mek, m, { reply, q, command, isOwner }) => {
  try {
    if (!isOwner) return reply("❌ Only owner can use this command.");

    // === Read current config from DB ===
    const config = await readEnv();
    if (config.CHR_MODE !== 'true') return reply("⚙️ CHR feature is *disabled* in database.\nUse `.setvar CHR_MODE true` to enable.");

    if (!q) return reply(`Usage:\n${command} https://whatsapp.com/channel/<id>/<message_id> Hello`);

    const [link, ...textParts] = q.split(" ");
    if (!link.includes("whatsapp.com/channel/")) return reply("❌ Invalid WhatsApp Channel link format.");

    const inputText = textParts.join(" ").toLowerCase();
    if (!inputText) return reply("Please provide text to stylize.");

    // === Convert to stylized ===
    const emoji = inputText
      .split("")
      .map(c => (c === " " ? "―" : stylizedChars[c] || c))
      .join("");

    // === Extract IDs ===
    const parts = link.split("/");
    const channelId = parts[4];
    const messageId = parts[5];
    if (!channelId || !messageId) return reply("⚠️ Invalid link - missing IDs.");

    // === Fetch channel info ===
    const channelMeta = await conn.newsletterMetadata("invite", channelId).catch(() => null);
    if (!channelMeta) return reply("❌ Could not fetch channel info.");

    // === Send reaction ===
    await conn.newsletterReactMessage(channelMeta.id, messageId, emoji);

    reply(`✅ *Reaction Sent!*
╭───────────────╮
┃ Channel : ${channelMeta.name}
┃ Reaction : ${emoji}
╰───────────────╯

> © Powered by shashika 🇱🇰`);
  } catch (err) {
    console.error(err);
    reply(`❎ Error: ${err.message || "Failed to send reaction"}`);
  }
});
