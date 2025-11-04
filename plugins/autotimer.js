const { cmd } = require('../command');
const { readEnv, writeEnv } = require('../lib/database');

let chatTimers = {}; // Store per chat timers

// === AutoTimer Global Switch ===
cmd({
  pattern: "autotimer",
  desc: "Enable or disable auto delete timer system",
  category: "main",
  use: ".autotimer on/off",
  filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {
  if (!isOwner) return reply("❌ Only bot owner can use this command.");

  const input = args[0]?.toLowerCase();
  if (!input) return reply("Usage: `.autotimer on` or `.autotimer off`");

  try {
    if (input === "on") {
      await writeEnv({ AUTO_TIMER: "true" });
      return reply("✅ *Auto Delete Timer system ENABLED!*");
    } else if (input === "off") {
      await writeEnv({ AUTO_TIMER: "false" });
      return reply("❌ *Auto Delete Timer system DISABLED!*");
    } else {
      return reply("Usage: `.autotimer on` or `.autotimer off`");
    }
  } catch (err) {
    console.error("AutoTimer DB Error:", err);
    reply("⚠️ Error updating AUTO_TIMER setting in database.");
  }
});

// === Set Timer per Chat ===
cmd({
  pattern: "timer",
  desc: "Set per chat auto delete timer (minutes)",
  category: "main",
  use: ".timer <minutes | off>",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, isGroup }) => {
  const config = await readEnv();
  if (config.AUTO_TIMER !== 'true') return;

  if (!args[0]) return reply("🕒 Usage: `.timer 2` (auto delete after 2 mins)\n`.timer off` to disable.");

  const input = args[0].toLowerCase();
  if (input === "off") {
    if (chatTimers[from]) {
      clearTimeout(chatTimers[from].timeout);
      delete chatTimers[from];
      return reply("❌ Auto delete timer disabled for this chat.");
    } else return reply("⚠️ No timer active in this chat.");
  }

  const minutes = parseInt(input);
  if (isNaN(minutes) || minutes <= 0) return reply("⚠️ Enter valid minutes.");

  chatTimers[from] = { duration: minutes * 60 * 1000 };
  return reply(`✅ Auto delete timer set for this chat.\n🕒 Duration: *${minutes} minute(s)*`);
});

// === Handle Messages for Deletion ===
cmd({
  on: "message"
}, async (conn, m, store, { from }) => {
  try {
    const config = await readEnv();
    if (config.AUTO_TIMER !== 'true') return;
    if (!m.message || !chatTimers[from]) return;

    const { duration } = chatTimers[from];
    setTimeout(async () => {
      try {
        await conn.sendMessage(from, { delete: m.key });
        console.log(`[⏰ AutoDelete] Message deleted from ${from}`);
      } catch (err) {
        console.error("Auto delete failed:", err);
      }
    }, duration);
  } catch (err) {
    console.error("Timer Message Handler Error:", err);
  }
});
