const { updateEnv } = require('../lib/database');
const EnvVar = require('../lib/mongodbenv');
const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "update",
    alias: ["updateenv"],
    react: "📈",
    desc: "Update environment variables",
    category: "owner",
    filename: __filename,
},
async (conn, mek, m, { from, q, reply, isOwner }) => {

    if (!isOwner) return reply("⚠️ *Owner only command.*");

    if (!q) return reply("📝 *Usage:* `.update KEY: VALUE`\n\nExample:\n.update PREFIX: /\n.update MODE: public");

    // Find delimiter (: or ,)
    const delimiterIndex = q.indexOf(':') !== -1 ? q.indexOf(':') : q.indexOf(',');
    if (delimiterIndex === -1) {
        return reply("❌ *Invalid format! Use:* `.update KEY: VALUE`");
    }

    // Split key & value
    const key = q.substring(0, delimiterIndex).trim().toUpperCase();
    const newValue = q.substring(delimiterIndex + 1).trim();

    if (!key || !newValue) return reply("❌ *Invalid format!* Example: `.update PREFIX: /`");

    // Check if key exists in DB
    const envVar = await EnvVar.findOne({ key });
    if (!envVar) {
        const allVars = await EnvVar.find({});
        const envList = allVars.map(v => `• *${v.key}:* ${v.value}`).join('\n');
        return reply(`❌ *The environment variable ➟ ${key} does not exist!* \n\n✅ *Available Variables:*\n${envList}`);
    }

    // Validation Rules
    const validModes = ['public', 'private', 'groups', 'inbox'];

    if (key === 'MODE' && !validModes.includes(newValue)) {
        return reply(`❌ *Invalid MODE value!*\nValid: ${validModes.join(', ')}`);
    }

    if (key.endsWith("_IMG") && !newValue.startsWith("http")) {
        return reply("❌ *Image URL must start with https://*");
    }

    if (['true','false'].includes(envVar.value) && !['true','false'].includes(newValue)) {
        return reply("❌ *This variable accepts only `true` or `false`.*");
    }

    try {
        // Update DB
        await updateEnv(key, newValue);

        // Update runtime config without restart
        config[key] = newValue;

        reply(`✅ *Updated Successfully!*\n\n*${key}* ➟ \`${newValue}\``);

    } catch (err) {
        reply("⚠️ *Failed to update variable.*");
        console.log(err);
    }
});
