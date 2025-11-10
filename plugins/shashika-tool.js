const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const translate = require('@vitalets/google-translate-api');
const { fetchJson } = require('../lib/functions');
const config = require("../config");
const { cmd, commands } = require("../command");

// COUNTRY INFO
cmd({
  pattern: "countryinfo",
  alias: ["cinfo", "country", "cinfo2"],
  desc: "Get information about a country",
  category: "tools",
  react: "🌍",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a country name.\nExample: `.countryinfo Pakistan`");

    const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.data) {
      await react("❌");
      return reply(`No information found for *${q}*. Please check the country name.`);
    }

    const info = data.data;
    let neighborsText = info.neighbors.length > 0
      ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
      : "No neighboring countries found.";

    const text = `
╔═════════════════════════╗
║       🌍 *${info.name}*       ║
╠═════════════════════════╣
║ 🏛  Capital       : ${info.capital}
║ 📍  Continent     : ${info.continent.name} ${info.continent.emoji}
║ 📞  Phone Code    : +${info.phoneCode}
║ 📏  Area          : ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)
║ 🚗  Driving Side  : ${info.drivingSide}
║ 💱  Currency      : ${info.currency}
║ 🔤  Languages     : ${info.languages.native.join(", ")}
║ 🌟  Famous For    : ${info.famousFor}
║ 🌍  ISO Codes     : ${info.isoCode.alpha2}/${info.isoCode.alpha3}
║ 🌎  Internet TLD  : ${info.internetTLD}
║ 🔗  Neighbors     : ${neighborsText}
╚═════════════════════════╝
`.trim();}`;

    await conn.sendMessage(from, {
      image: { url: info.flag },
      caption: text,
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: mek });

    await react("✅");
  } catch (e) {
    console.error("Error in countryinfo command:", e);
    await react("❌");
    reply("An error occurred while fetching country information.");
  }
});



cmd({
  pattern: "tempmail",
  alias: ["genmail"],
  desc: "Generate a new temporary email address",
  category: "other",
  react: "📧",
  filename: __filename
},
async (conn, mek, m, {
  from,
  reply,
  prefix
}) => {
  try {
    const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail');
    const {
      email,
      session_id,
      expires_at
    } = response.data;

    // Format the expiration time and date
    const expiresDate = new Date(expires_at);
    const timeString = expiresDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const dateString = expiresDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Create the complete message
    const message3 = `
╭─❖ ❖ ❖ TEMP EMAIL ❖ ❖ ❖─╮
│ 📬  Email: ${email}
│ ⏳  Expires: ${timeString} • ${dateString}
│ 🔐  Session: \`${session_id}\`
│
│ ➜ Check inbox: .inbox ${session_id}
╰──────────────────────────╯

⚠️ *Note:* Email auto-expires after 24 hours.
`;

    await conn.sendMessage(
      from, {
        text: message,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '123450987650123450@newsletter',
            newsletterName: 'shashika',
            serverMessageId: 101
          }
        }
      }, {
        quoted: mek
      }
    );

  } catch (e) {
    console.error('TempMail error:', e);
    reply(`❌ Error: ${e.message}`);
  }
});
cmd({
  pattern: "checkmail",
  alias: ["inbox", "tmail", "mailinbox"],
  desc: "Check your temporary email inbox",
  category: "other",
  react: "📬",
  filename: __filename
},
async (conn, mek, m, {
  from,
  reply,
  args
}) => {
  try {
    const sessionId = args[0];
    if (!sessionId) return reply('🔑 Please provide your session ID\nExample: .checkmail YOUR_SESSION_ID');

    const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
    const response = await axios.get(inboxUrl);

    if (!response.data.success) {
      return reply('❌ Invalid session ID or expired email');
    }

    const {
      inbox_count,
      messages
    } = response.data;

    if (inbox_count === 0) {
      return reply('📭 Your inbox is empty');
    }

    let messageList = `📬 *You have ${inbox_count} message(s)*\n\n`;
    messages.forEach((msg, index) => {
      messageList += `━━━━━━━━━━━━━━━━━━\n` +
        `📌 *Message ${index + 1}*\n` +
        `👤 *From:* ${msg.from}\n` +
        `📝 *Subject:* ${msg.subject}\n` +
        `⏰ *Date:* ${new Date(msg.date).toLocaleString()}\n\n` +
        `📄 *Content:*\n${msg.body}\n\n`;
    });

    await reply(messageList);

  } catch (e) {
    console.error('CheckMail error:', e);
    reply(`❌ Error checking inbox: ${e.response?.data?.message || e.message}`);
  }
});

cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        if (!q) return reply("❗ Please provide a city name. Usage: .weather [city name]");
        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        // 9) Table-like (aligned columns)
const weather = `
╔════════════════════════════════╗
║         WEATHER SUMMARY        ║
╠════════════════════════════════╣
║ City      : ${data.name}, ${data.sys.country}
║ Temp      : ${data.main.temp}°C
║ Feels     : ${data.main.feels_like}°C
║ Min / Max : ${data.main.temp_min}°C / ${data.main.temp_max}°C
║ Humidity  : ${data.main.humidity}%
║ Pressure  : ${data.main.pressure} hPa
║ Wind      : ${data.wind.speed} m/s
║ Sky       : ${data.weather[0].main} — ${data.weather[0].description}
╚════════════════════════════════╝

Powered: ${botName}
`;
        return reply(weather);
    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 City not found. Please check the spelling and try again.");
        }
        return reply("⚠️ An error occurred while fetching the weather information. Please try again later.");
    }
});

cmd({
    pattern: "trsi",
    desc: "Translate English → Sinhala (reply to a message)",
    category: "tools",
    react: "🌐",
    filename: __filename
}, async (conn, mek, m, { reply, react }) => {
    const msg = m.quoted?.text;
    if (!msg) return reply("කරුණාකර reply එකක් දෙන්න.");

    try {
        const res = await translate(msg, { to: 'si' });
        await react("✅");
        return reply(`🇱🇰 *සිංහලට පරිවර්තනය:* \n\n${res.text}`);
    } catch (e) {
        console.error("Translate Error:", e);
        await react("❌");
        return reply("පරිවර්තනය අසාර්ථකයි.");
    }
});

// Sinhala ➜ English
cmd({
    pattern: "trans",
    desc: "Translate Sinhala → English (reply to a message)",
    category: "tools",
    react: "🌐",
    filename: __filename
}, async (conn, mek, m, { reply, react }) => {
    const msg = m.quoted?.text;
    if (!msg) return reply("Please reply to a Sinhala message to translate.");

    try {
        const res = await translate(msg, { to: 'en' });
        await react("✅");
        return reply(`🇬🇧 *Translated to English:* \n\n${res.text}`);
    } catch (e) {
        console.error("Translate Error:", e);
        await react("❌");
        return reply("Translation failed.");
    }
});


cmd({
    pattern: "tts",
    desc: "Convert Sinhala text to speech",
    react: "🗣️",
    category: "tools",
    filename: __filename
}, async (conn, m, msg, { text, from }) => {
    if (!text) {
        return await conn.sendMessage(from, { text: "නිදසුනක්: `.tts මම ඔයාට ආදරෙයි`" });
    }

    try {
        const ttsRes = await axios({
            method: "GET",
            url: `https://translate.google.com/translate_tts`,
            params: {
                ie: "UTF-8",
                q: text,
                tl: "si",
                client: "tw-ob"
            },
            responseType: "arraybuffer"
        });

        const filePath = path.join(__dirname, '../temp', `${Date.now()}.mp3`);
        fs.writeFileSync(filePath, ttsRes.data);

        await conn.sendMessage(from, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mp4',
            ptt: true
        });

        fs.unlinkSync(filePath);
    } catch (err) {
        console.error("TTS Error:", err);
        await conn.sendMessage(from, { text: "වැරදුනා! අසාර්තකයි." });
    }
});


cmd({
    pattern: "person",
    react: "👤",
    alias: ["userinfo", "profile"],
    desc: "Get complete user profile information",
    category: "other",
    use: '.person [@tag or reply]',
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, quoted, participants }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        // 1. DETERMINE TARGET USER
        let userJid = quoted?.sender || 
                     mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     sender;

        // 2. VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // 3. GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        // 4. GET NAME (MULTI-SOURCE FALLBACK)
        let userName = userJid.split('@')[0];
        try {
            // Try group participant info first
            if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }
            
            // Try contact DB
            if (userName === userJid.split('@')[0] && conn.contactDB) {
                const contact = await conn.contactDB.get(userJid).catch(() => null);
                if (contact?.name) userName = contact.name;
            }
            
            // Try presence as final fallback
            if (userName === userJid.split('@')[0]) {
                const presence = await conn.presenceSubscribe(userJid).catch(() => null);
                if (presence?.pushname) userName = presence.pushname;
            }
        } catch (e) {
            console.log("Name fetch error:", e);
        }

        // 5. GET BIO/ABOUT
        let bio = {};
        try {
            // Try personal status
            const statusData = await conn.fetchStatus(userJid).catch(() => null);
            if (statusData?.status) {
                bio = {
                    text: statusData.status,
                    type: "Personal",
                    updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
                };
            } else {
                // Try business profile
                const businessProfile = await conn.getBusinessProfile(userJid).catch(() => null);
                if (businessProfile?.description) {
                    bio = {
                        text: businessProfile.description,
                        type: "Business",
                        updated: null
                    };
                }
            }
        } catch (e) {
            console.log("Bio fetch error:", e);
        }

        // 6. GET GROUP ROLE
        let groupRole = "";
        if (isGroup) {
            const participant = participants.find(p => p.id === userJid);
            groupRole = participant?.admin ? "👑 Admin" : "👥 Member";
        }

        // 7. FORMAT OUTPUT
        const formattedBio = bio.text ? 
            `${bio.text}\n└─ 📌 ${bio.type} Bio${bio.updated ? ` | 🕒 ${bio.updated.toLocaleString()}` : ''}` : 
            "No bio available";

        const userInfo = `
╭━━━〔 *👤 GC MEMBER INFORMATION* 〕━━━╮

┌─❖ *BASIC INFO*
│ 💠 *Name:* ${userName}
│ 🔢 *Number:* ${userJid.replace(/@.+/, '')}
│ 🪪 *Account Type:* ${user.isBusiness ? "💼 Business" : user.isEnterprise ? "🏢 Enterprise" : "👤 Personal"}
└─────────────◆

┌─❖ *ABOUT*
│ ${formattedBio || "No Bio Found"}
└─────────────◆

┌─❖ *ACCOUNT STATUS*
│ ✅ *Registered:* ${user.isUser ? "Yes" : "No"}
│ 🛡️ *Verified:* ${user.verifiedName ? "✅ Verified" : "❌ Not Verified"}
${isGroup ? `│ 👥 *Group Role:* ${groupRole}` : ""}
└─────────────◆

> *© Powered by ${botName} ⚡*
`.trim();

        // 8. SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: userInfo,
            mentions: [userJid]
        }, { quoted: mek });

    } catch (e) {
        console.error("Person command error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile"}`);
    }
});



cmd({
    pattern: "get",
    alias: ["source", "js"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "🫥",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {
    try {
      const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
        if (!isOwner) return reply("❌ You don't have permission to use this command!");
        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get alive`");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName)));

        if (!commandData) return reply("❌ Command not found!");

        // Get the command file path
        const commandPath = commandData.filename;

        // Read the full source code
        const fullCode = fs.readFileSync(commandPath, 'utf-8');

        // Truncate long messages for WhatsApp
        let truncatedCode = fullCode;
        if (truncatedCode.length > 4000) {
            truncatedCode = fullCode.substring(0, 4000) + "\n\n// Code too long, sending full file 📂";
        }

        // Formatted caption with truncated code
        const formattedCode = `
╭━━━〔 *📦 Command Source Code* 〕━━━╮
│ Below is the extracted/preview code
│ Full source is attached separately ✨
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

\`\`\`js
${truncatedCode}
\`\`\`

> ⚡ *Full File Successfully Sent*  
> © Powered By: *${botName}*
`;

        // Send image with truncated source code
        await conn.sendMessage(from, { 
            image: { url: config.MAIN_IMAGE_URL }  // Image URL
            caption: formattedCode,
            contextInfo: { // FIX: Correctly placing contextInfo inside the message options
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // Send full source file
        const fileName = `${commandName}.js`;
        const tempPath = path.join(__dirname, fileName);
        fs.writeFileSync(tempPath, fullCode);

        await conn.sendMessage(from, { 
            document: fs.readFileSync(tempPath),
            mimetype: 'text/javascript',
            fileName: fileName
        }, { quoted: mek });

        // Delete the temporary file
        fs.unlinkSync(tempPath);

    } catch (e) {
        console.error("Error in .get command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Function definitions and imports are revealed

