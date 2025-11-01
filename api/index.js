import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ====== CONFIG ======
const TOKEN = "8522122227:AAEkfXrhqDKSBZpXXrFZWcomvJnVoFHqrGQ"; // 🔸 यहां अपना Bot Token डालो
const CHANNEL_USERNAME = "@ABOUT_JALLAD_PAPA"; // 🔸 आपका चैनल username
const API_URL = "https://random-remove-batch-tea.trycloudflare.com/search?mobile=";


// ====== HELPER ======
async function isUserMember(chatId) {
  try {
    const member = await bot.getChatMember(CHANNEL_USERNAME, chatId);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch (e) {
    return false;
  }
}

// ====== COMMAND: /start ======
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const startMsg = `
<b>🤖 𝐖ᴇʟᴄᴏᴍᴇ 𝐭ᴏ 𝐈ɴɢᴏғɪɴᴅᴇʀ 𝐁ᴏᴛ!</b>
★ 𝐁ᴇғᴏʀᴇ 𝐒ᴛᴀʀᴛ 𝐉ᴏɪɴ 𝐎ᴜʀ 𝐂ʜᴀɴɴᴇʟ 

𝐔sᴀɢᴇ: <code>/info 9876543210</code>
𝐈ғ 𝐘ᴏᴜ 𝐅ᴀᴄᴇ 𝐀ɴʏ 𝐏ʀᴏʙʟᴇᴍ 𝐂ᴏɴᴛᴀᴄᴛ 𝐎ᴡɴᴇʀ
`;

  await bot.sendMessage(chatId, startMsg, { parse_mode: "HTML" });
});

// ====== COMMAND: /help ======
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMsg = `
<b>🛠 Bᴏᴛ Cᴏᴍᴍᴀɴᴅ Hᴇʟᴘ</b>

🔹 <code>/start</code> — sᴛᴀʀᴛ ᴛʜᴇ ʙᴏᴛ
🔹 <code>/info [number]</code> — ɢᴇᴛ ᴅᴇᴛᴀɪʟs ᴏғ ɴᴜᴍʙᴇʀ
🔹 <code>/help</code> — Hᴇʟᴘ ᴍᴇɴᴊ

<b>Note:</b> 𝐁𝐄𝐅𝐎𝐑𝐄 𝐔𝐒𝐄 𝐓𝐇𝐈𝐒 𝐁𝐎𝐓 𝐉𝐎𝐈𝐍 𝐎𝐔𝐑 𝐂𝐇𝐀𝐍𝐍𝐄𝐋📢
`;

  bot.sendMessage(chatId, helpMsg, { parse_mode: "HTML" });
});

// ====== COMMAND: /info ======
bot.onText(/\/info (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const number = match[1].trim();

  // check channel membership
  const member = await isUserMember(chatId);
  if (!member) {
    return bot.sendMessage(chatId, "🚫 <b> 𝐀ᴄᴄᴇss Dᴇɴɪᴇᴅ !</b>\n𝐏ʟᴇᴀsᴇ 𝐉ᴏɪɴ 𝐎ᴜʀ 𝐂ʜᴀɴɴᴇʟ", {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📢 Join Channel", url: `https://t.me/ABOUT_JALLAD_PAPA` }
          ]
        ]
      }
    });
  }

  // fetch API
  try {
    const res = await fetch(API_URL + number);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return bot.sendMessage(chatId, "❌ 𝐍ᴏ Dᴇᴛᴀɪʟs Fᴏᴜɴᴅ", { parse_mode: "HTML" });
    }

    // format results
    let msgText = "<b>📞 Nᴜᴍʙᴇʀ Iɴғᴏʀᴍᴀᴛɪᴏɴ :</b>\n\n";
    data.data.forEach((item, i) => {
      msgText += `🔹 <b>Result ${i + 1}</b>\n`;
      msgText += `👤 <b>Name:</b> ${item.name || "N/A"}\n`;
      msgText += `🧑‍🦱 <b>Father:</b> ${item.fname || "N/A"}\n`;
      msgText += `📍 <b>Address:</b> ${item.address || "N/A"}\n`;
      msgText += `📱 <b>Mobile:</b> ${item.mobile || "N/A"}\n`;
      msgText += `☎️ <b>Alt:</b> ${item.alt || "N/A"}\n`;
      msgText += `🗺 <b>Circle:</b> ${item.circle || "N/A"}\n`;
      msgText += `🆔 <b>Dᴏᴄᴜᴍᴇɴᴛ:</b> ${item.id || "N/A"}\n\n`;
    });

    await bot.sendMessage(chatId, msgText, { parse_mode: "HTML" });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "⚠️ 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧");
  }
});

// ====== EXPRESS ENDPOINT ======
app.post("/api", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("🤖 Bot is running!");
});

app.listen(3000, () => console.log("Bot server running!"));
