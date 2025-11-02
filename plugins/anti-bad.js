const { cmd } = require('../command');
const { readEnv } = require('../lib/database'); // read from MongoDB

cmd({ on: "body" }, async (conn, m, store, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
  try {
    //=== Load dynamic config from database ===//
    const config = await readEnv();

    // Check Anti-Bad-Word setting
    const antiBad = config.ANTI_BAD_WORD || "false";
    if (antiBad !== "true") return;

    // Dynamic bad word list from DB or fallback default
    const badWordsRaw = config.BAD_WORD_LIST || "wtf,mia,xxx,fuck,sex,huththa,pakaya,ponnaya,hutto";
    const badWords = badWordsRaw.split(',').map(w => w.trim().toLowerCase());

    if (!isGroup || isAdmins || !isBotAdmins) return;

    const messageText = body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord) {
      // Delete message
      await conn.sendMessage(from, { delete: m.key });
      // Send warning message
      await conn.sendMessage(from, {
        text: "🚫 *Bad Words Not Allowed Here!* 🚫\n\n⚠️ Please keep the chat clean."
      }, { quoted: m });
    }

  } catch (error) {
    console.error("Anti-BadWords Error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
