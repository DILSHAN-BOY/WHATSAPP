const { updateEnv, readEnv } = require('../lib/database');
const EnvVar = require('../lib/mongodbenv');
const { cmd } = require('../command');

cmd({
  pattern: "update",
  alias: ["updateenv"],
  react: "📈",
  desc: "Check and update environment variables",
  category: "owner",
  filename: __filename,
},
async (conn, mek, m, { from, q, reply, isOwner }) => {
  if (!isOwner) return reply("❌ Only owner can use this command!");

  if (!q) return reply("🪄 *Change For Settings USE ➟* `.setting`");

  // 🧠 Remove the word "update" if accidentally included
  q = q.replace(/^update\s*/i, "").trim();

  const delimiterIndex = q.indexOf(':') !== -1 ? q.indexOf(':') : q.indexOf(',');
  if (delimiterIndex === -1)
    return reply("🗣️ *Invalid format! Please use the format:* `.update KEY: VALUE`");

  const key = q.substring(0, delimiterIndex).trim().toUpperCase(); // uppercase normalize
  const value = q.substring(delimiterIndex + 1).trim();

  if (!key || !value)
    return reply("🗣️ *Invalid format. Please use:* `.update KEY: VALUE`");

  const validModes = ['public', 'private', 'groups', 'inbox'];

  if (key === 'MODE' && !validModes.includes(value))
    return reply(`🗣️ *Invalid MODE. Use:* ${validModes.join(', ')}`);

  if (key === 'ALIVE_IMG' && !value.startsWith('https://'))
    return reply("🗣️ *Invalid URL format. Must start with https://*");

  if (key === 'AUTO_READ_STATUS' && !['true', 'false'].includes(value))
    return reply("🗣️ *AUTO_READ_STATUS must be true or false.*");

  try {
    const envVar = await EnvVar.findOne({ key });

    if (!envVar) {
      const allEnvVars = await EnvVar.find({});
      const envList = allEnvVars.map(env => `${env.key}: ${env.value}`).join('\n');
      return reply(`❌ *The environment variable ➟ ${key} does not exist.*\n\n*✅ Existing variables:*\n*USE ➟ .setting*\n${envList}`);
    }

    await updateEnv(key, value);
    reply(`✅ *Environment variable updated successfully!*\n\n🧩 *${key}* → \`${value}\``);

  } catch (err) {
    console.error('Error updating environment variable:', err);
    reply("🙇‍♂️ *Failed to update the variable.*");
  }
});
