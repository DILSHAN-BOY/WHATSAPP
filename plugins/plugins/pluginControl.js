const Plugin = require('../lib/pluginModel');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
  pattern: "addplugin",
  desc: "Add a new plugin from code",
  category: "owner",
  use: ".addplugin <name>",
  react: "📥"
}, async (conn, mek, m, { args, reply, q }) => {
  try {
    if (!args[0]) return reply("📦 Use: `.addplugin <name>` and reply with JS code file or paste code after command.");
    const name = args[0].toLowerCase();
    const code = q || (m.quoted && m.quoted.text);
    if (!code) return reply("📜 Please provide JavaScript code.");

    const fileName = `${name}.js`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, code, 'utf-8');

    await Plugin.findOneAndUpdate(
      { name },
      { name, path: fileName, code, status: true },
      { upsert: true, new: true }
    );

    reply(`✅ *Plugin ${name} added & enabled successfully!*\nUse *.plugin list* to check status.`);
    delete require.cache[require.resolve(filePath)];
    require(filePath);

  } catch (err) {
    console.error(err);
    reply("❌ Add Plugin Error: " + err.message);
  }
});

// Plugin Controller
cmd({
  pattern: "plugin",
  desc: "Enable/disable/list plugins",
  category: "owner",
  react: "🧠"
}, async (conn, mek, m, { args, reply }) => {
  const action = args[0]?.toLowerCase();
  if (!action) return reply("Use: `.plugin list`, `.plugin on <name>`, `.plugin off <name>`");

  if (action === 'list') {
    const all = await Plugin.find();
    if (!all.length) return reply("📁 No plugins found.");
    let msg = "🧩 *Plugin List:*\n\n";
    for (let p of all) {
      msg += `🔹 *${p.name}* — ${p.status ? "✅ ON" : "❌ OFF"}\n`;
    }
    return reply(msg);
  }

  if (['on', 'off'].includes(action)) {
    const name = args[1];
    if (!name) return reply("⚙️ Example: `.plugin on fb`");
    const plugin = await Plugin.findOne({ name });
    if (!plugin) return reply(`❌ Plugin "${name}" not found.`);
    plugin.status = action === 'on';
    await plugin.save();
    reply(`✅ Plugin "${name}" turned ${plugin.status ? "ON" : "OFF"}.`);
  }
});
