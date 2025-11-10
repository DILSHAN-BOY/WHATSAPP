const { cmd } = require('../command');
const { readEnv } = require('../lib/database');
const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');

cmd({
    pattern: "topdf",
    alias: ["pdf","topdf"],use: '.topdf',
    desc: "Convert provided text to a PDF file.",
    react: "📄",
    category: "convert",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply("Please provide the text you want to convert to PDF. *Eg* `.topdf` *Tanzania Daressalaam*");

        // Create a new PDF document
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            // Send the PDF file
            await conn.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'shashika',
                caption: `
*📒created successully!*
`
            }, { quoted: mek });
        });

        // Add text to the PDF
        doc.text(q);

        // Finalize the PDF and end the stream
        doc.end();

    } catch (e) {
        console.error(e);
        reply(`Error: ${e.message}`);
    }
});


cmd({
    pattern: "msg",
    desc: "Send a message multiple times (Owner Only)",
    category: "other",
    react: "🔁",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, q }) => {
  const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    // Owner-only restriction
    if (!isCreator) return reply('🚫 *Owner only command!*');

    try {
    
        // Check format: .msg text,count
        if (!q.includes(',')) {
            return reply("❌ *Format:* .msg text,count\n*Example:* .msg Hello,5");
        }

        const [message, countStr] = q.split(',');
        const count = parseInt(countStr.trim());

        // Hard limit: 1-100 messages
        if (isNaN(count) || count < 1 || count > 100) {
            return reply("❌ *Max 10 messages at once!*");
        }

        // Silent execution (no confirmations)
        for (let i = 0; i < count; i++) {
            await conn.sendMessage(from, { text: message }, { quoted: null });
            if (i < count - 1) await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }

    } catch (e) {
        console.error("Error in msg command:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});



cmd({
  pattern: "getpp",
  alias: [],
  use: "pp",
  desc: "Get profile picture of a user (replied user in group, or DM user)",
  category: "tools",
  react: "✅",
  filename: __filename
},
async (conn, mek, m, { from, sender, reply, isGroup }) => {
  try {
    const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.participant;
    const quotedKey = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let targetJid;

    if (isGroup) {
      if (quotedMsg && quotedKey) {
        targetJid = quotedMsg;
      } else {
        return reply("❌ Please reply to someone's message to get their profile picture.");
      }
    } else {
      targetJid = from.endsWith("@s.whatsapp.net") ? from : sender;
    }

    let imageUrl;
    try {
      imageUrl = await conn.profilePictureUrl(targetJid, 'image');
    } catch {
      imageUrl = config.MAIN_MENU_URL";
    }

    const fakeVCard = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "✅",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: ✅\nORG: ;\nTEL;type=CELL;type=VOICE;waid=255700000000:+255 700 000000\nEND:VCARD",
          jpegThumbnail: Buffer.from([])
        }
      }
    };

    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: `✅ Profile Picture of @${targetJid.split('@')[0]}`,
      contextInfo: {
        mentionedJid: [targetJid],
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "❀° ┄───╮",
          newsletterJid: "123450987650123450@newsletter"
        }
      }
    }, { quoted: fakeVCard });

  } catch (err) {
    console.error("Error in getpp:", err);
    reply("❌ Failed to fetch profile picture.");
  }
});

const { cmd } = require('../command');

cmd({
    pattern: "obfuscate",
    alias: ["obf", "securejs"],
    desc: "Obfuscate JavaScript code",
    react: "🔒",
    category: "tools",
    use: 'Reply to a JavaScript message with .obfuscate',
    filename: __filename
},
async (conn, mek, m, { from, reply, quoted }) => {
    try {
        // Try to load the obfuscator package
        let JavaScriptObfuscator;
        try {
            JavaScriptObfuscator = require('javascript-obfuscator');
        } catch (e) {
            return reply(
                "❌ Package not installed!\n\n" +
                "Run this command to install:\n" +
                "```bash\nnpm install javascript-obfuscator\n```" +
                "\nThen restart your bot."
            );
        }

        // Check if it's a reply
        if (!quoted || !quoted.text) {
            return reply("❌ Please reply to a JavaScript code message");
        }

        const originalCode = quoted.text;
        
        // Obfuscation options (high security)
        const obfuscationOptions = {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            shuffleStringArray: true,
            splitStrings: true,
            stringArrayThreshold: 0.8,
            rotateStringArray: true,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            identifierNamesGenerator: 'hexadecimal',
            selfDefending: true,
            disableConsoleOutput: false,
            debugProtection: false,
            debugProtectionInterval: false,
            transformObjectKeys: true,
            unicodeEscapeSequence: true
        };

        // Obfuscate the code
        const obfuscatedResult = JavaScriptObfuscator.obfuscate(originalCode, obfuscationOptions);
        const obfuscatedCode = obfuscatedResult.getObfuscatedCode();

        // Create before/after comparison
        const comparison = `
📜 *ORIGINAL CODE (${formatBytes(originalCode.length)}):*
\`\`\`javascript
${truncate(originalCode, 200)}
\`\`\`

🔒 *OBFUSCATED CODE (${formatBytes(obfuscatedCode.length)}):*
\`\`\`javascript
${truncate(obfuscatedCode, 300)}
\`\`\`

✅ Obfuscation complete! Sending secured code file...
`.trim();

        // Send the comparison as a message
        await reply(comparison);

        // Send the full obfuscated code as a text file
        await conn.sendMessage(
            from, 
            {
                document: Buffer.from(obfuscatedCode),
                fileName: 'secured_code.js',
                mimetype: 'application/javascript',
                caption: `🔒 Secured JavaScript Code | Obfuscated by YOU 🫵🏻`
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error("Obfuscation Error:", e);
        reply(`❌ Obfuscation failed: ${e.message}`);
    }
});

// Helper function to truncate long text
function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...\n\n⚠️ TRUNCATED - DOWNLOAD FULL FILE BELOW';
}

// Helper function to format bytes
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
          }
          
                      
