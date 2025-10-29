const {cmd , commands} = require('../command')
const fg = require('api-dylux')
const yts = require('yt-search')

cmd({
    pattern: "song",
    desc: "Check bot online or no.",
    react: "🍀",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return reply("❤️‍🔥please give me a provide YouTube link or title❤️‍🔥\n🤨යූට්යුබ් ලින්ක් එකක් හෝ නමක් දෙන්න 🥹
const search = await yts(q)
const data = search.videos[0];
const url = data.url

let desc = '
「🐉𝐀𝐔𝐃𝐈𝐎🐉」
┃ 👨‍💻Owner: SHASHIKA DILSHAN
┃ 🤖 Bot Name: AGNI
┗━━━━━━━━━━━━━━━𖣔𖣔

┏━❮ 🩵𝐃𝐄𝐓𝐀𝐋𝐄𝐒🩵 ❯━
┃🤖 *Title:* ${data.title}
┃📑 *Duration:* ${data.timestamp}
┃🔖 *Views:* ${data.views}
┃📟 *Uploaded On:* ${data.ago}
┗━━━━━━━━━━━━━━𖣔𖣔

╭━━〔𝐀𝐆𝐍𝐈〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃•1 | 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 
┃◈┃•2 |     by
┃◈┃•3 |  𝐬𝐡𝐚𝐬𝐡𝐢𝐤𝐚
┃◈└───────────┈⊷
╰──────────────┈⊷ 
'


const sentMsg = await conn.sendMessage(from, {image: { url: data.thumbnail}, caption: desc},{quoted:mek});


let down = await fg.yta(url)
let downloadUrl = down.dl_url
 

await conn.sendMessage(from, {audio: { url: downloadUrl }, mimetype: "audio/mpeg"},{quoted:mek})

}catch(e){
console.log(e)
reply('${e}')
}
})
