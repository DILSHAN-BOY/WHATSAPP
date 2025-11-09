const { cmd } = require('../command');
const { getGroupAdmins } = require('../lib/functions');

// --------------------- HIDETAG ---------------------
cmd({
  pattern: "hidetag",
  alias: ["htag"],
  react: "📢",
  desc: "Tags everyone without showing numbers",
  category: "group",
  filename: __filename,
  use: "<text>"
}, async (conn, mek, m, { from, isGroup, reply, participants, q, isBotAdmins, isAdmins }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isAdmins) return reply("🚫 Only admins can use this");
  if (!isBotAdmins) return reply("🚫 I must be admin");

  try {
    await conn.sendMessage(from, {
      text: q || '',
      mentions: participants.map(p => p.id)
    }, { quoted: mek });
  } catch (err) {
    console.log(err);
    reply("⚠️ Error occurred");
  }
});

// --------------------- KICK ---------------------
cmd({
  pattern: "kick",
  alias: ["remove"],
  react: "🥏",
  desc: "Remove participant from group",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, mentionByTag }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isAdmins) return reply("🚫 You must be admin");
  if (!isBotAdmins) return reply("🚫 I must be admin");

  let target = (await mentionByTag) || m.msg.contextInfo?.participant;
  if (!target) return reply("🚫 Couldn't find user");

  await conn.groupParticipantsUpdate(from, [target], "remove");
  reply("✅ User removed");
});

// --------------------- PROMOTE ---------------------
cmd({
  pattern: "promote",
  alias: ["addadmin"],
  react: "🥏",
  desc: "Promote member to admin",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, mentionByTag, participants }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isAdmins) return reply("🚫 You must be admin");
  if (!isBotAdmins) return reply("🚫 I must be admin");

  let target = (await mentionByTag) || m.msg.contextInfo?.participant;
  if (!target) return reply("🚫 Couldn't find user");

  const admins = await getGroupAdmins(participants);
  if (admins.includes(target)) return reply("✅ User is already admin");

  await conn.groupParticipantsUpdate(from, [target], "promote");
  reply("✅ User promoted");
});

// --------------------- DEMOTE ---------------------
cmd({
  pattern: "demote",
  alias: ["removeadmin"],
  react: "🥏",
  desc: "Demote admin to member",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, mentionByTag, participants }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isAdmins) return reply("🚫 You must be admin");
  if (!isBotAdmins) return reply("🚫 I must be admin");

  let target = (await mentionByTag) || m.msg.contextInfo?.participant;
  if (!target) return reply("🚫 Couldn't find user");

  const admins = await getGroupAdmins(participants);
  if (!admins.includes(target)) return reply("✅ User is not admin");

  await conn.groupParticipantsUpdate(from, [target], "demote");
  reply("✅ User demoted");
});

// --------------------- MUTE ---------------------
cmd({
  pattern: "mute",
  alias: ["close"],
  react: "🔒",
  desc: "Only admins can send messages",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isBotAdmins) return reply("🚫 I must be admin");
  if (!isAdmins) return reply("🚫 You must be admin");

  await conn.groupSettingUpdate(from, 'announcement');
  reply("🔒 Group muted (only admins can send messages)");
});

// --------------------- UNMUTE ---------------------
cmd({
  pattern: "unmute",
  alias: ["open"],
  react: "🔓",
  desc: "All members can send messages",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isBotAdmins) return reply("🚫 I must be admin");
  if (!isAdmins) return reply("🚫 You must be admin");

  await conn.groupSettingUpdate(from, 'not_announcement');
  reply("🔓 Group unmuted (all members can send messages)");
});

// --------------------- LEAVE ---------------------
cmd({
  pattern: "leave",
  alias: ["left", "kickme"],
  react: "🔓",
  desc: "Leave the group",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isMe, reply }) => {
  if (!isGroup) return reply("🚫 Group only command");
  if (!isMe) return reply("🚫 Only bot can use this");

  await conn.sendMessage(from, { text: "👋 Goodbye everyone" }, { quoted: mek });
  await conn.groupLeave(from);
});

//====================================≠==============

cmd({
  pattern: "requests",
  desc: "View pending join requests",
  react: "📝",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
  if (!isGroup) return reply("This command can only be used in groups.");

  const group = await conn.groupMetadata(from);
  const bot = conn.user.id.split(":")[0] + "@s.whatsapp.net";

  const isBotAdmin = group.participants.find(p => p.id === bot)?.admin;
  if (!isBotAdmin) return reply("I must be admin to view join requests.");

  try {
    const requests = await conn.groupRequestParticipantsList(from);
    if (!requests.length) return reply("No pending join requests.");

    let text = `*Pending Join Requests:*\n\n`;
    requests.forEach((user, i) => {
      text += `${i + 1}. @${user.id.split("@")[0]}\n`;
    });

    reply(text, { mentions: requests.map(u => u.id) });

  } catch (err) {
    console.log(err);
    reply("⚠️ Failed to retrieve join requests.");
  }
});


cmd({
  pattern: "accept",
  desc: "Accept join requests",
  use: ".accept 1,2",
  react: "✅",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, match }) => {
  if (!isGroup) return reply("This command is only for groups.");

  const group = await conn.groupMetadata(from);
  const bot = conn.user.id.split(":")[0] + "@s.whatsapp.net";

  const isBotAdmin = group.participants.find(p => p.id === bot)?.admin;
  if (!isBotAdmin) return reply("I must be admin to accept requests.");

  try {
    const requests = await conn.groupRequestParticipantsList(from);
    if (!requests.length) return reply("No pending requests.");

    if (!match) return reply("Send request numbers. Example: .accept 1,3");

    const picks = match.split(",").map(x => Number(x.trim()) - 1);
    for (let i of picks) {
      if (requests[i]) {
        await conn.groupRequestParticipantsUpdate(from, [requests[i].id], "accept");
      }
    }

    reply(`✅ Accepted ${picks.length} request(s).`);

  } catch (err) {
    console.log(err);
    reply("⚠️ Error while accepting requests.");
  }
});


cmd({
  pattern: "reject",
  desc: "Reject join requests",
  use: ".reject 1,2",
  react: "❌",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, match }) => {
  if (!isGroup) return reply("This command is only for groups.");

  const group = await conn.groupMetadata(from);
  const bot = conn.user.id.split(":")[0] + "@s.whatsapp.net";

  const isBotAdmin = group.participants.find(p => p.id === bot)?.admin;
  if (!isBotAdmin) return reply("I must be admin to reject requests.");

  try {
    const requests = await conn.groupRequestParticipantsList(from);
    if (!requests.length) return reply("No pending requests.");

    if (!match) return reply("Send request numbers. Example: .reject 2");

    const picks = match.split(",").map(x => Number(x.trim()) - 1);
    for (let i of picks) {
      if (requests[i]) {
        await conn.groupRequestParticipantsUpdate(from, [requests[i].id], "reject");
      }
    }

    reply(`❌ Rejected ${picks.length} request(s).`);

  } catch (err) {
    console.log(err);
    reply("⚠️ Error while rejecting requests.");
  }
});
