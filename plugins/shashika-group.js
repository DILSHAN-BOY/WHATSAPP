const { readEnv } = require('../lib/database');
const {
  cmd,
  commands
} = require('../command');
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require("../lib/functions");
cmd({
  'pattern': "requests",
  'desc': "View pending join requests",
  'use': ".requests",
  'react': '📝',
  'category': 'group',
  'filename': __filename
}, async (_0x45122f, _0x48cfdb, _0x27c13f, {
  from: _0x274439,
  isGroup: _0xd402c1,
  reply: _0x280253
}) => {
  if (!_0xd402c1) {
    return await _0x280253("This command can only be used in groups.");
  }
  const _0x2865a7 = _0x45122f.user.jid;
  const _0x609318 = await _0x45122f.groupMetadata(_0x274439);
  const _0x2a3edd = _0x609318.participants.some(_0xf2e2b6 => _0xf2e2b6.jid === _0x2865a7 && _0xf2e2b6.admin);
  if (!_0x2a3edd) {
    return await _0x280253("I'm not an admin in this group.");
  }
  try {
    const _0x1e9852 = await _0x45122f.groupRequestParticipantsList(_0x274439);
    if (_0x1e9852.length === 0x0) {
      return await _0x280253("No pending join requests.");
    }
    let _0x28f452 = "Pending Join Requests:\n\n";
    _0x1e9852.forEach((_0x3319f2, _0xf35d05) => {
      _0x28f452 += _0xf35d05 + 0x1 + ". @" + _0x3319f2.jid.split('@')[0x0] + "\n";
    });
    return await _0x280253(_0x28f452, {
      'mentions': _0x1e9852.map(_0x103a40 => _0x103a40.jid)
    });
  } catch (_0x38b736) {
    console.error("Error retrieving join requests:", _0x38b736);
    return await _0x280253("Failed to retrieve join requests. Please try again later.");
  }
});
cmd({
  'pattern': "accept",
  'desc': "Accept group join request(s)",
  'use': ".accept <request numbers>",
  'react': '✔️',
  'category': "group",
  'filename': __filename
}, async (_0x328133, _0x10c866, _0x580d8b, {
  from: _0x11076a,
  isGroup: _0x2db667,
  reply: _0x36bd74,
  match: _0x5811bf
}) => {
  if (!_0x2db667) {
    return await _0x36bd74("This command can only be used in groups.");
  }
  const _0x4656ce = _0x328133.user.jid;
  const _0x3672f2 = await _0x328133.groupMetadata(_0x11076a);
  const _0x86f20a = _0x3672f2.participants.some(_0xe35850 => _0xe35850.jid === _0x4656ce && _0xe35850.admin);
  if (!_0x86f20a) {
    return await _0x36bd74("_I'm not an admin in this group._");
  }
  try {
    const _0x29fe60 = await _0x328133.groupRequestParticipantsList(_0x11076a);
    if (_0x29fe60.length === 0x0) {
      return await _0x36bd74("No pending join requests.");
    }
    if (!_0x5811bf) {
      return await _0x36bd74("_Provide the number(s) of the request(s) to accept, separated by commas._");
    }
    const _0x3afda0 = _0x5811bf.split(',').map(_0x445a6 => parseInt(_0x445a6.trim()) - 0x1);
    const _0x19db69 = _0x3afda0.filter(_0x4566b3 => _0x4566b3 >= 0x0 && _0x4566b3 < _0x29fe60.length);
    if (_0x19db69.length === 0x0) {
      return await _0x36bd74("_Invalid request number(s)._");
    }
    for (let _0x2b5694 of _0x19db69) {
      await _0x328133.groupRequestParticipantsUpdate(_0x11076a, [_0x29fe60[_0x2b5694].jid], "accept");
    }
    return await _0x36bd74("_Accepted " + _0x19db69.length + " join request(s)._");
  } catch (_0x3a1710) {
    console.error("Error accepting join requests:", _0x3a1710);
    await _0x328133.sendMessage(_0x11076a, {
      'react': {
        'text': '❌',
        'key': _0x10c866.key
      }
    });
    return await _0x36bd74("Failed to accept join requests. Please try again later.");
  }
});
cmd({
  'pattern': "reject",
  'desc': "Reject group join request(s)",
  'use': ".reject <request numbers>",
  'react': '❌',
  'category': "group",
  'filename': __filename
}, async (_0x5aa8ae, _0x3aa7ea, _0x4e0037, {
  from: _0x5ddb5e,
  isGroup: _0x2a9a14,
  reply: _0x27c108,
  match: _0x339a4e
}) => {
  if (!_0x2a9a14) {
    return await _0x27c108("This command can only be used in groups.");
  }
  const _0x92293 = _0x5aa8ae.user.jid;
  const _0x9550a9 = await _0x5aa8ae.groupMetadata(_0x5ddb5e);
  const _0x45d2d9 = _0x9550a9.participants.some(_0x534566 => _0x534566.jid === _0x92293 && _0x534566.admin);
  if (!_0x45d2d9) {
    return await _0x27c108("I'm not an admin in this group.");
  }
  try {
    const _0x224a70 = await _0x5aa8ae.groupRequestParticipantsList(_0x5ddb5e);
    if (_0x224a70.length === 0x0) {
      return await _0x27c108("No pending join requests.");
    }
    if (!_0x339a4e) {
      return await _0x27c108("Provide the number(s) of the request(s) to reject, separated by commas.");
    }
    const _0x2b9a8e = _0x339a4e.split(',').map(_0x37e6a2 => parseInt(_0x37e6a2.trim()) - 0x1);
    const _0x329b34 = _0x2b9a8e.filter(_0x1b7c8c => _0x1b7c8c >= 0x0 && _0x1b7c8c < _0x224a70.length);
    if (_0x329b34.length === 0x0) {
      return await _0x27c108("_Invalid request number(s)._");
    }
    for (let _0x340454 of _0x329b34) {
      await _0x5aa8ae.groupRequestParticipantsUpdate(_0x5ddb5e, [_0x224a70[_0x340454].jid], "reject");
    }
    return await _0x27c108("_Rejected " + _0x329b34.length + " join request(s)._");
  } catch (_0x1e39d6) {
    console.error("Error rejecting join requests:", _0x1e39d6);
    await _0x5aa8ae.sendMessage(_0x5ddb5e, {
      'react': {
        'text': '❌',
        'key': _0x3aa7ea.key
      }
    });
    return await _0x27c108("Failed to reject join requests. Please try again later.");
  }
});
cmd({
  'pattern': "hidetag",
  'react': '📢',
  'alias': ["htag"],
  'desc': "Tags everyone in group without showing numbers",
  'category': "group",
  'filename': __filename,
  'use': '<text>'
}, async (_0x43d008, _0x2f66b1, _0x5641c5, {
  from: _0x525a24,
  l: _0x2fcb15,
  quoted: _0x4e7e89,
  body: _0x2e0563,
  isCmd: _0x54673e,
  command: _0x3af637,
  args: _0x39aa23,
  q: _0xb890cb,
  isGroup: _0x1cfc7a,
  sender: _0x397097,
  senderNumber: _0xf165fc,
  botNumber2: _0x24f442,
  botNumber: _0x530f8e,
  pushname: _0x307615,
  isMe: _0x59913e,
  isOwner: _0x3c508d,
  groupMetadata: _0x58e349,
  groupName: _0x43c14c,
  participants: _0x1ba1c8,
  isItzcp: _0x157d78,
  groupAdmins: _0x3edb41,
  isBotAdmins: _0x50df92,
  isAdmins: _0x7b81ef,
  reply: _0x485483
}) => {
  if (!_0x1cfc7a) {
    return _0x485483("Group only command ⛔");
  }
  if (!_0x3c508d && !_0x7b81ef) {
    return _0x485483("Only admins can use this command ⛔");
  }
  if (!_0x50df92) {
    return _0x485483("I need to be admin to tag members ⛔");
  }
  try {
    _0x43d008.sendMessage(_0x5641c5.chat, {
      'text': _0xb890cb ? _0xb890cb : '',
      'mentions': _0x1ba1c8.map(_0x3ac41d => _0x3ac41d.id)
    }, {
      'quoted': _0x2f66b1
    });
  } catch (_0xce1277) {
    _0x485483("*Error !!*");
    _0x2fcb15(_0xce1277);
  }
});
cmd({
  'pattern': "kick",
  'react': '🥏',
  'alias': ["remove"],
  'desc': "To Remove a participant from Group",
  'category': "group",
  'use': ".kick",
  'filename': __filename
}, async (_0xdce09d, _0x6dfbf0, _0xe8c00b, {
  from: _0x38c54a,
  l: _0x31e8ef,
  quoted: _0x5d5b2c,
  body: _0x733e71,
  isCmd: _0x43b36e,
  command: _0x1851b8,
  mentionByTag: _0x58af09,
  args: _0x479f65,
  q: _0x3b6f91,
  isGroup: _0x5eaf07,
  sender: _0x11a5c2,
  senderNumber: _0x30bab0,
  botNumber2: _0x46dda5,
  botNumber: _0x1c28df,
  pushname: _0x241287,
  isMe: _0x9a36ae,
  isOwner: _0x4fa48b,
  groupMetadata: _0x3bd134,
  groupName: _0x362989,
  participants: _0x13259a,
  groupAdmins: _0xb6e18,
  isBotAdmins: _0x3168dd,
  isCreator: _0x475512,
  isDev: _0x5cfca6,
  isAdmins: _0x226519,
  reply: _0x575f88
}) => {
  try {
    if (!_0x5eaf07) {
      return _0x575f88("Group only command ⛔");
    }
    if (!_0x226519) {
      if (!_0x9a36ae) {
        return _0xdce09d.sendMessage(_0x38c54a, {
          'text': "🚫 *This is admin only command*"
        }, {
          'quoted': _0x6dfbf0
        });
      }
    }
    if (!_0x3168dd) {
      return _0x575f88("❌ *Bot must be Admin Frist*  ❗");
    }
    const _0x443cc0 = await _0x58af09;
    let _0x29eb6e = (await _0x443cc0) || _0x6dfbf0.msg.contextInfo.participant;
    if (!_0x29eb6e) {
      return _0x575f88("🚫 *Couldn't find any user in context*");
    }
    await _0xdce09d.groupParticipantsUpdate(_0x38c54a, [_0x29eb6e], 'remove');
    await _0xdce09d.sendMessage(_0x38c54a, {
      'text': "*Removed 🚫*"
    }, {
      'quoted': _0x6dfbf0
    });
  } catch (_0x3e4e56) {
    _0x575f88("🚫 *Error Accurated !!*\n\n" + _0x3e4e56);
    console.log(_0x3e4e56);
  }
});
cmd({
  'pattern': "promote",
  'react': '🥏',
  'alias': ["addadmin"],
  'desc': "To Add a participatant as a Admin",
  'category': 'group',
  'use': ".promote",
  'filename': __filename
}, async (_0x3a5108, _0x5b879a, _0x5840c3, {
  from: _0x7770da,
  l: _0x3d9286,
  quoted: _0x38c6a6,
  body: _0xa596f0,
  isCmd: _0x4d1c83,
  command: _0x3a8e87,
  mentionByTag: _0x2beb81,
  args: _0x5c1cc6,
  q: _0x29ff24,
  isGroup: _0x80f157,
  sender: _0x265cbb,
  senderNumber: _0x523a1,
  botNumber2: _0x11f7f2,
  botNumber: _0x53f17b,
  pushname: _0x32fcc8,
  isMe: _0x52a065,
  isOwner: _0x12f367,
  groupMetadata: _0x58ad61,
  groupName: _0x13222d,
  participants: _0x1119bf,
  groupAdmins: _0x459d33,
  isBotAdmins: _0x2dcbfb,
  isCreator: _0x65ccea,
  isDev: _0x2d7c0c,
  isAdmins: _0x1f150a,
  reply: _0x351170
}) => {
  try {
    if (!_0x80f157) {
      return _0x351170("Group only command ⛔");
    }
    if (!_0x1f150a) {
      if (!_0x52a065) {
        return _0x3a5108.sendMessage(_0x7770da, {
          'text': "🚫 *This is admin only command*"
        }, {
          'quoted': _0x5b879a
        });
      }
    }
    if (!_0x2dcbfb) {
      return _0x351170("*Bot must be admin first ❗*");
    }
    const _0x1ad3d8 = await _0x2beb81;
    let _0x296495 = (await _0x1ad3d8) || _0x5b879a.msg.contextInfo.participant;
    if (!_0x296495) {
      return _0x351170("🚫 *Couldn't find any user in context*");
    }
    const _0x411184 = await getGroupAdmins(_0x1119bf);
    if (_0x411184.includes(_0x296495)) {
      return _0x351170("*User all ready and admin ✅*");
    }
    await _0x3a5108.groupParticipantsUpdate(_0x7770da, [_0x296495], "promote");
    await _0x3a5108.sendMessage(_0x7770da, {
      'text': "*Promoted as an admin ✔️*"
    }, {
      'quoted': _0x5b879a
    });
  } catch (_0x3b6df9) {
    _0x351170("🚫 *Error Accurated !!*\n\n" + _0x3b6df9);
    console.log(_0x3b6df9);
  }
});
cmd({
  'pattern': "demote",
  'react': '🥏',
  'alias': ['removeadmin'],
  'desc': "To Demote Admin to Member",
  'category': "group",
  'use': ".demote",
  'filename': __filename
}, async (_0x221f78, _0x144ac5, _0x33a047, {
  from: _0x3ae426,
  l: _0x2c9380,
  quoted: _0x290a5c,
  body: _0x32af62,
  isCmd: _0x4721b1,
  command: _0xe2fa5,
  mentionByTag: _0x118f13,
  args: _0x2b1358,
  q: _0x3424ce,
  isGroup: _0x3aa644,
  sender: _0x10ccd2,
  senderNumber: _0x4e701f,
  botNumber2: _0x11c53e,
  botNumber: _0x4dc68a,
  pushname: _0x3e0332,
  isMe: _0x26a87f,
  isOwner: _0x2f062d,
  groupMetadata: _0x55c993,
  groupName: _0x3f49d1,
  participants: _0x595707,
  groupAdmins: _0x3ca541,
  isBotAdmins: _0x2b3f67,
  isCreator: _0x239076,
  isDev: _0x48dbb0,
  isAdmins: _0x1264c4,
  reply: _0x879175
}) => {
  try {
    if (!_0x3aa644) {
      return _0x879175("Group only command ⛔");
    }
    if (!_0x1264c4) {
      if (!_0x26a87f) {
        return _0x221f78.sendMessage(_0x3ae426, {
          'text': "🚫 *This is admin only command*"
        }, {
          'quoted': _0x144ac5
        });
      }
    }
    if (!_0x2b3f67) {
      return _0x879175("*Bot must be admin first ❗*");
    }
    const _0x1cca3c = await _0x118f13;
    let _0x494d0c = (await _0x1cca3c) || _0x144ac5.msg.contextInfo.participant;
    if (!_0x494d0c) {
      return _0x879175("🚫 *Couldn't find any user in context*");
    }
    const _0xeffd50 = await getGroupAdmins(_0x595707);
    if (!_0xeffd50.includes(_0x494d0c)) {
      return _0x879175("*User all ready not and admin ✅*");
    }
    await _0x221f78.groupParticipantsUpdate(_0x3ae426, [_0x494d0c], "demote");
    await _0x221f78.sendMessage(_0x3ae426, {
      'text': "*User no longer an admin ✔️*"
    }, {
      'quoted': _0x144ac5
    });
  } catch (_0x570bea) {
    _0x879175("🚫 *Error Accurated !!*\n\n" + _0x570bea);
    console.log(_0x570bea);
  }
});
cmd({
  'pattern': "mute",
  'react': '🔒',
  'alias': ["close", "mute_cyber"],
  'desc': "Change to group settings to only admins can send messages.",
  'category': "group",
  'use': ".mute",
  'filename': __filename
}, async (_0x2472ef, _0x1c7d02, _0x5ea27b, {
  from: _0x446df6,
  l: _0x56750a,
  quoted: _0x291091,
  body: _0x3e56dd,
  isCmd: _0x1ec536,
  command: _0x1c6ec4,
  args: _0x4eb4ba,
  q: _0xe4e442,
  isGroup: _0x12bd1f,
  sender: _0x440c90,
  senderNumber: _0x2832d7,
  botNumber2: _0x5094a2,
  botNumber: _0x430053,
  pushname: _0x174f77,
  isMe: _0x2316dd,
  isOwner: _0x5affbe,
  groupMetadata: _0x5899b3,
  groupName: _0x1233ed,
  participants: _0x24abde,
  groupAdmins: _0x505011,
  isBotAdmins: _0x4e4b43,
  isCreator: _0x9d422e,
  isDev: _0x22659a,
  isAdmins: _0x53646b,
  reply: _0x116de9
}) => {
  try {
    if (!_0x12bd1f) {
      return _0x116de9("🚫 *This is Group command*");
    }
    if (!_0x4e4b43) {
      return _0x116de9("🚫 *Bot must be Admin frist*");
    }
    if (!_0x53646b) {
      if (!_0x2316dd) {
        return _0x116de9("🚫 *You must be admin frist*");
      }
    }
    await _0x2472ef.groupSettingUpdate(_0x446df6, 'announcement');
    await _0x2472ef.sendMessage(_0x446df6, {
      'text': "*Group chat muted🔒*"
    }, {
      'quoted': _0x1c7d02
    });
  } catch (_0x3e87f4) {
    _0x116de9("*Error !!*");
    console.log(_0x3e87f4);
  }
});
cmd({
  'pattern': "unmute",
  'react': '🔓',
  'alias': ['open', 'unmute_cyber'],
  'desc': "Change to group settings to all members can send messages.",
  'category': "group",
  'use': ".unmute",
  'filename': __filename
}, async (_0x237b2a, _0x50e14f, _0x40cbfb, {
  from: _0x5b1200,
  l: _0x166fb5,
  quoted: _0x162251,
  body: _0x11e6d1,
  isCmd: _0x41e09f,
  command: _0x34e31a,
  args: _0x2e56b8,
  q: _0x49e0fc,
  isGroup: _0x42b359,
  sender: _0x424876,
  senderNumber: _0x5c2ad5,
  botNumber2: _0x16c669,
  botNumber: _0x72876d,
  pushname: _0x1141d6,
  isMe: _0x4e6d0b,
  isOwner: _0x2cdcd7,
  groupMetadata: _0x39955f,
  groupName: _0x400903,
  participants: _0x1df702,
  groupAdmins: _0x281687,
  isBotAdmins: _0x1eff46,
  isCreator: _0x316e4d,
  isDev: _0x29a8c7,
  isAdmins: _0x5d803b,
  reply: _0x51a50e
}) => {
  try {
    if (!_0x42b359) {
      return _0x51a50e("🚫 *This is Group command*");
    }
    if (!_0x1eff46) {
      return _0x51a50e("🚫 *Bot must be Admin frist*");
    }
    if (!_0x5d803b) {
      if (!_0x4e6d0b) {
        return _0x51a50e("🚫 *You must be admin frist*");
      }
    }
    await _0x237b2a.groupSettingUpdate(_0x5b1200, "not_announcement");
    await _0x237b2a.sendMessage(_0x5b1200, {
      'text': "*Group chat unmuted 🔓*"
    }, {
      'quoted': _0x50e14f
    });
  } catch (_0x3c4b48) {
    _0x51a50e("*Error !!*");
    console.log(_0x3c4b48);
  }
});
cmd({
  'pattern': "join",
  'desc': "joins group by link",
  'category': 'main',
  'use': "<group link.>"
}, async (_0x5ef5d0, _0x50f66d, _0x1079e0, {
  from: _0xfdfb30,
  l: _0x74eafe,
  quoted: _0x2753d3,
  body: _0x26a88f,
  isCmd: _0x25fdcc,
  command: _0x3ae3cf,
  args: _0x2f7821,
  q: _0xa4da97,
  isGroup: _0x3b3266,
  sender: _0x16752e,
  senderNumber: _0x41ec50,
  botNumber2: _0x479de9,
  botNumber: _0x40e518,
  pushname: _0x1ee06a,
  isSachintha: _0x291724,
  isSavi: _0x3ec9de,
  isSadas: _0x37cbb2,
  isMani: _0x41c20a,
  isMe: _0x18a0b2,
  isOwner: _0x3d52b6,
  isDev: _0x486709,
  groupMetadata: _0x5a70e4,
  groupName: _0xe2211e,
  participants: _0x46a560,
  groupAdmins: _0x2e0f5c,
  isBotAdmins: _0x5a41f4,
  isAdmins: _0x4c8229,
  reply: _0x275765
}) => {
  if (!_0x3d52b6 && !_0x291724 && !_0x3ec9de && !_0x486709 && !_0x41c20a && !_0x18a0b2) {
    return;
  }
  try {
    if (!_0xa4da97) {
      return _0x275765("Please give me Query");
    }
    if (!_0xa4da97.split(" ")[0x0] && !_0xa4da97.split(" ")[0x0].includes('whatsapp.com')) {
      _0x275765("Link Invalid, Please Send a valid whatsapp Group Link!");
    }
    let _0x24c77e = _0xa4da97.split(" ")[0x0].split("https://chat.whatsapp.com/")[0x1];
    await _0x5ef5d0.groupAcceptInvite(_0x24c77e).then(_0x7e9c3b => _0x275765("*Joined group ✔️*"))["catch"](_0x900e2c => _0x275765("Error in Joining Group"));
  } catch (_0x32565d) {
    _0x275765("🚩 Not Found !");
    console.log(_0x32565d);
  }
});
cmd({
  'pattern': "del",
  'react': '⛔',
  'alias': [','],
  'desc': "delete message",
  'category': "main",
  'use': ".del",
  'filename': __filename
}, async (_0x459a10, _0x297aa3, _0x434fd7, {
  from: _0x446a0f,
  l: _0x356e71,
  quoted: _0x12bd8e,
  body: _0x57d107,
  isCmd: _0x4acc01,
  isDev: _0x446969,
  command: _0x153ff7,
  args: _0x4fa3c6,
  q: _0x79ff2c,
  isGroup: _0x4b775c,
  sender: _0x10caf4,
  senderNumber: _0x126999,
  botNumber2: _0x21dd7d,
  botNumber: _0x3ec7e9,
  pushname: _0x42f655,
  isSachintha: _0x5ac8d8,
  isSavi: _0x410bcb,
  isSadas: _0x391e24,
  isMani: _0x264a23,
  isMe: _0x365dfa,
  isOwner: _0x3d117b,
  groupMetadata: _0x40ae40,
  groupName: _0x40df8f,
  participants: _0x3ca07d,
  groupAdmins: _0x4a9236,
  isBotAdmins: _0x3906bd,
  isAdmins: _0x5bab83,
  reply: _0x2f4896
}) => {
  try {
    const _0x3a7a62 = {
      'remoteJid': _0x434fd7.chat,
      'fromMe': false,
      'id': _0x434fd7.quoted.id,
      'participant': _0x434fd7.quoted.sender
    };
    await _0x459a10.sendMessage(_0x434fd7.chat, {
      'delete': _0x3a7a62
    });
  } catch (_0x1cd4a8) {
    _0x2f4896("*Error !!*");
    _0x356e71(_0x1cd4a8);
  }
});
cmd({
  'pattern': "leave",
  'react': '🔓',
  'alias': ["left", "kickme"],
  'desc': "To leave from the group",
  'category': "group",
  'use': '.leave',
  'filename': __filename
}, async (_0x4993a8, _0xeb5f1f, _0x219a74, {
  from: _0x4b6e32,
  l: _0x379e12,
  quoted: _0x290d8c,
  body: _0x39ca36,
  isCmd: _0x5e0e8c,
  command: _0x47e5f5,
  args: _0x22202c,
  q: _0x42e566,
  isGroup: _0x43c7ae,
  sender: _0x1abb79,
  senderNumber: _0x4be115,
  botNumber2: _0x2cbfd5,
  botNumber: _0x316173,
  pushname: _0x267c70,
  isMe: _0x3c91f5,
  isOwner: _0x401f8b,
  groupMetadata: _0x1d0e55,
  groupName: _0xa4d274,
  participants: _0x2007dd,
  groupAdmins: _0x14df38,
  isBotAdmins: _0x276a12,
  isCreator: _0x3736d1,
  isDev: _0x298272,
  isAdmins: _0x2009e8,
  reply: _0x2530aa
}) => {
  try {
    if (!_0x43c7ae) {
      return _0x2530aa("🚫 *This is Group command*");
    }
    if (!_0x3c91f5) {
      return _0x2530aa("🚫 *This is Group command*");
    }
    await _0x4993a8.sendMessage(_0x4b6e32, {
      'text': "🔓 *Good Bye All*"
    }, {
      'quoted': _0xeb5f1f
    });
    await _0x4993a8.groupLeave(_0x4b6e32);
  } catch (_0x4eef91) {
    _0x2530aa("*Error !!*");
    console.log(_0x4eef91);
  }
});
cmd({
  'pattern': 'invite',
  'react': '🖇️',
  'alias': ["grouplink", "glink"],
  'desc': "To Get the Group Invite link",
  'category': 'group',
  'use': ".invite",
  'filename': __filename
}, async (_0x2a26af, _0x581c18, _0x5a0165, {
  from: _0xeab51b,
  l: _0x52871c,
  quoted: _0x555e0c,
  body: _0x3b0f05,
  isCmd: _0x33e4e1,
  command: _0x2b2585,
  args: _0x459054,
  q: _0x16e76d,
  isGroup: _0x4226d3,
  sender: _0x5042a0,
  senderNumber: _0x1ebb51,
  botNumber2: _0x4539ff,
  botNumber: _0x33e3f2,
  pushname: _0x447ffc,
  isMe: _0x2bb834,
  isOwner: _0x446433,
  groupMetadata: _0x501fc0,
  groupName: _0x55b462,
  participants: _0x4bed88,
  groupAdmins: _0x29ca93,
  isBotAdmins: _0x126dc8,
  isCreator: _0x5362c5,
  isDev: _0x56be5a,
  isAdmins: _0x3d0dff,
  reply: _0x209c3a
}) => {
  try {
    if (!_0x4226d3) {
      return _0x209c3a("🚫 *This is Group command*");
    }
    if (!_0x126dc8) {
      return _0x209c3a("🚫 *Bot must be Admin frist*");
    }
    if (!_0x3d0dff) {
      if (!_0x2bb834) {
        return _0x209c3a("🚫 *You must be admin frist*");
      }
    }
    const _0x5f1035 = await _0x2a26af.groupInviteCode(_0xeab51b);
    await _0x2a26af.sendMessag
