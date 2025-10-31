const {readEnv} = require('../lib/database')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "join",
    react: "📬",
    alias: ["joinme","f_join"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join <Group Link>',
    filename: __filename
},
async(conn, mek, m, { from, args, q, isCreator, isDev, isOwner, isMe, reply }) => {
    // Define messages locally
    const msr = {
        own_cmd: "☢️ This command can only be used by the bot owner/developer! ☢️",
        no_args: "⚠️ Please write the Group Link 🖇️",
        invalid_link: "⚠️ Invalid WhatsApp group link!",
        join_success: "📬 Successfully Joined ✅",
        join_error: "❌ Failed to join the group!",
        error_generic: "❌ Something went wrong! Please try again."
    };

    try {
        // Permission check
        if (!isCreator && !isDev && !isOwner && !isMe) return reply(msr.own_cmd);

        // Check if user provided group link
        if (!q) return reply(msr.no_args);
        if (!args[0].includes("https://chat.whatsapp.com/")) return reply(msr.invalid_link);

        // Extract invite code
        let code = args[0].split('https://chat.whatsapp.com/')[1];

        // Join the group
        await conn.groupAcceptInvite(code);
        await conn.sendMessage(from, { text: msr.join_success }, { quoted: mek });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`${msr.join_error}\n\n${e}`);
    }
})

// ===== Messages Object =====
const msr = {
    only_gp: "⚠️ This command can only be used in a group!",
    you_adm: "⚠️ Only group admins can use this command!",
    give_adm: "⚠️ I need to be an admin to perform this action!",
    own_cmd: "☢️ This command can only be used by the bot owner/developer! ☢️",
    no_args: "⚠️ Please provide the required arguments!",
    user_already_admin: "❗ User is already an admin!",
    user_not_admin: "❗ User is not an admin!",
    error_generic: "❌ Something went wrong! Please try again!"
};

// ===== Invite Command =====
cmd({
    pattern: "invite",
    react: "🖇️",
    alias: ["grouplink","glink"],
    desc: "To Get the Group Invite link",
    category: "group",
    use: '.invite',
    filename: __filename
}, async(conn, mek, m,{from, isGroup, isAdmins, isBotAdmins, reply}) => {
    try{
        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins) return reply(msr.you_adm);
        if (!isBotAdmins) return reply(msr.give_adm);

        const code = await conn.groupInviteCode(from);
        await conn.sendMessage(from , { text: `*🖇️ Group Link*\n\nhttps://chat.whatsapp.com/${code}`}, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Revoke Command =====
cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink","resetglink","revokelink","f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
}, async(conn, mek, m,{from, isGroup, isAdmins, isBotAdmins, reply}) => {
    try{
        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins) return reply(msr.you_adm);
        if (!isBotAdmins) return reply(msr.give_adm);

        await conn.groupRevokeInvite(from);
        await conn.sendMessage(from , { text: `*Group link Reseted* ⛔`}, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Promote Command =====
cmd({
    pattern: "promote",
    react: "🥏",
    alias: ["addadmin"],
    desc: "Promote a participant as an Admin",
    category: "group",
    use: '.promote',
    filename: __filename
}, async(conn, mek, m,{from, isGroup, isAdmins, isBotAdmins, participants, reply}) => {
    try{
        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins) return reply(msr.you_adm);
        if (!isBotAdmins) return reply(msr.give_adm);

        let user = mek.mentionedJid ? mek.mentionedJid[0] : mek.msg.contextInfo?.participant;
        if (!user) return reply(msr.no_args);

        const groupAdmins = participants.filter(p => p.admin).map(a => a.id);
        if (groupAdmins.includes(user)) return reply(msr.user_already_admin);

        await conn.groupParticipantsUpdate(from, [user], "promote");
        reply(`✅ User promoted as Admin.`);
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Demote Command =====
cmd({
    pattern: "demote",
    react: "🥏",
    alias: ["removeadmin"],
    desc: "Demote Admin to Member",
    category: "group",
    use: '.demote',
    filename: __filename
}, async(conn, mek, m,{from, isGroup, isAdmins, isBotAdmins, participants, reply}) => {
    try{
        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins) return reply(msr.you_adm);
        if (!isBotAdmins) return reply(msr.give_adm);

        let user = mek.mentionedJid ? mek.mentionedJid[0] : mek.msg.contextInfo?.participant;
        if (!user) return reply(msr.no_args);

        const groupAdmins = participants.filter(p => p.admin).map(a => a.id);
        if (!groupAdmins.includes(user)) return reply(msr.user_not_admin);

        await conn.groupParticipantsUpdate(from, [user], "demote");
        reply(`✅ User demoted to Member.`);
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Hidetag Command =====
cmd({
    pattern: "hidetag",
    react: "🔊",
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
}, async(conn, mek, m,{from, isGroup, isAdmins, isBotAdmins, participants, q, reply}) => {
    try{
        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins) return reply(msr.you_adm);
        if (!isBotAdmins) return reply(msr.give_adm);
        if (!q) return reply(msr.no_args);

        conn.sendMessage(from, { text: q, mentions: participants.map(a => a.id) }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== TagAll Command =====
cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["gc_tagall"],
    desc: "To Tag all Members",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, participants, reply }) => {
    try {
        if (!participants) return reply("❌ No members found in this group.");

        let teks = "📣 *Attention Everyone!*\n\n";
        for (let mem of participants) teks += `@${mem.id.split('@')[0]} `;
        conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Add User Command =====
cmd({
    pattern: "add",
    react: "➕",
    desc: "Adds a user to the group.",
    category: "group",
    use: '<number>',
    filename: __filename
}, async(conn, mek, m,{from, q, isGroup, isBotAdmins, senderNumber, reply}) => {
    try {
        if (!isGroup) return reply(msr.only_gp);
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) return reply(msr.own_cmd);
        if (!isBotAdmins) return reply(msr.give_adm);
        if (!q) return reply(msr.no_args);

        let userToAdd = `${q}@s.whatsapp.net`;
        await conn.groupParticipantsUpdate(from, [userToAdd], "add");
        reply(`✅ User ${q} added to group.`);
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Leave Command =====
cmd({
    pattern: "leave",
    react: "🎉",
    desc: "Leave the group",
    category: "owner",
    filename: __filename
}, async(conn, mek, m,{from, senderNumber, isGroup, reply}) => {
    try {
        if (!isGroup) return reply(msr.only_gp);
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) return reply(msr.own_cmd);

        reply("👋 Leaving group...");
        await sleep(1500);
        await conn.groupLeave(from);
    } catch (e) {
        console.log(e);
        reply(msr.error_generic);
    }
});

// ===== Lock/Unlock/Mute/Unmute Commands =====
async function updateGroupSetting(conn, mek, from, type, reply, isGroup, isAdmins, isBotAdmins) {
    if (!isGroup) return reply(msr.only_gp);
    if (!isAdmins) return reply(msr.you_adm);
    if (!isBotAdmins) return reply(msr.give_adm);
    await conn.groupSettingUpdate(from, type);
}

cmd({ pattern: "lockgc", react: "🔒", desc: "Lock group", category:"group", filename:__filename }, async(conn, mek, m, args) => {
    await updateGroupSetting(conn, mek, m.from, "locked", m.reply, m.isGroup, m.isAdmins, m.isBotAdmins);
    m.reply("✅ Group locked.");
});
cmd({ pattern: "unlockgc", react: "🔓", desc: "Unlock group", category:"group", filename:__filename }, async(conn, mek, m, args) => {
    await updateGroupSetting(conn, mek, m.from, "unlocked", m.reply, m.isGroup, m.isAdmins, m.isBotAdmins);
    m.reply("✅ Group unlocked.");
});
cmd({ pattern: "mute", react: "🔇", desc: "Mute group", category:"group", filename:__filename }, async(conn, mek, m, args) => {
    await updateGroupSetting(conn, mek, m.from, "announcement", m.reply, m.isGroup, m.isAdmins, m.isBotAdmins);
    m.reply("✅ Group muted.");
});
cmd({ pattern: "unmute", react: "🔊", desc: "Unmute group", category:"group", filename:__filename }, async(conn, mek, m, args) => {
    await updateGroupSetting(conn, mek, m.from, "not_announcement", m.reply, m.isGroup, m.isAdmins, m.isBotAdmins);
    m.reply("✅ Group unmuted.");
});
