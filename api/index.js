import fetch from "node-fetch";

const BOT_TOKEN = "8522122227:AAEkfXrhqDKSBZpXXrFZWcomvJnVoFHqrGQ"; // ← अपना token डालो
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const CHANNEL_USERNAME = "@ABOUT_JALLAD_PAPA"; // ← अपना Telegram channel username डालो (जैसे "@MyChannel")

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Bot is running ✅");

  try {
    const body = req.body;
    if (!body.message || !body.message.chat) return res.status(200).send("No message");

    const chatId = body.message.chat.id;
    const text = body.message.text?.trim() || "";

    // 🧩 Channel join check
    const isMember = await checkMembership(chatId);
    if (!isMember && !["/start", "/help"].some(cmd => text.startsWith(cmd))) {
      await sendMessage(
        chatId,
        `🚫 *Access Denied!*\n𝐏ʟᴇᴀsᴇ 𝐉ᴏɪɴ 𝐎ᴜʀ 𝐂ʜᴀɴɴᴇʟ:\n👉 @ABOUT_JALLAD_PAPA`,
        true
      );
      return res.status(200).send("User not joined");
    }

    // 🟢 /start command
    if (text === "/start") {
      await sendMessage(
        chatId,
        `<b>🤖 𝐖ᴇʟᴄᴏᴍᴇ 𝐭ᴏ 𝐈ɴɢᴏғɪɴᴅᴇʀ 𝐁ᴏᴛ!</b>
★ 𝐁ᴇғᴏʀᴇ 𝐒ᴛᴀʀᴛ 𝐉ᴏɪɴ 𝐎ᴜʀ 𝐂ʜᴀɴɴᴇʟ 

𝐔sᴀɢᴇ: <code>/info 9876543210</code>
𝐈ғ 𝐘ᴏᴜ 𝐅ᴀᴄᴇ 𝐀ɴʏ 𝐏ʀᴏʙʟᴇᴍ 𝐂ᴏɴᴛᴀᴄᴛ 𝐎ᴡɴᴇʀ`,
        { parse_mode: "HTML" }
      );
    }

    // 🟢 /help command
    else if (text === "/help") {
      await sendMessage(
        chatId,
        `<b>🛠 Bᴏᴛ Cᴏᴍᴍᴀɴᴅ Hᴇʟᴘ</b>

🔹 <code>/start</code> — sᴛᴀʀᴛ ᴛʜᴇ ʙᴏᴛ
🔹 <code>/info [number]</code> — ɢᴇᴛ ᴅᴇᴛᴀɪʟs ᴏғ ɴᴜᴍʙᴇʀ
🔹 <code>/help</code> — Hᴇʟᴘ ᴍᴇɴᴊ

<b>Note:</b> 𝐁𝐄𝐅𝐎𝐑𝐄 𝐔𝐒𝐄 𝐓𝐇𝐈𝐒 𝐁𝐎𝐓 𝐉𝐎𝐈𝐍 𝐎𝐔𝐑 𝐂𝐇𝐀𝐍𝐍𝐄𝐋📢`,
        { parse_mode: "HTML" }
      );
    }

    // 🟢 /info command
    else if (text.startsWith("/info")) {
      const parts = text.split(" ");
      if (parts.length < 2) {
        await sendMessage(chatId, "❗ 𝐏ʟᴇᴀsᴇ 𝐒ᴇɴᴅ 𝐈ᴛ 𝐈ɴᴛᴏ 𝐓ʜɪs 𝐅ᴏʀᴍᴀᴛ:\n`/info 9876543210`", true);
      } else {
        const number = parts[1].trim();
        if (!/^\d{10}$/.test(number)) {
          await sendMessage(chatId, "📩 𝐏ʟᴇᴀsᴇ valid 10-digit mobile number ।", true);
        } else {
          const response = await fetch(`https://random-remove-batch-tea.trycloudflare.com/search?mobile=${number}`);
          const data = await response.json();

          if (data && data.data && data.data.length > 0) {
            let reply = data.data.map(
              (d, i) =>
                `📞 *Mobile:* ${d.mobile || "N/A"}\n👤 *Name:* ${d.name || "N/A"}\n👨‍👦 *Father:* ${d.fname || "N/A"}\n🏠 *Address:* ${d.address || "N/A"}\n📱 *Alternate:* ${d.alt || "N/A"}\n🌐 *Circle:* ${d.circle || "N/A"}\n🆔 *ID:* ${d.id || "N/A"}`
            ).join("\n\n────────────────────\n\n");

            await sendMessage(chatId, reply, true);
          } else {
            await sendMessage(chatId, "❌ 𝐍ᴏ 𝐃ᴀᴛᴀ 𝐅ᴏᴜɴᴅ।", true);
          }
        }
      }
    }

    // ❓ Unknown text
    else {
      await sendMessage(chatId, "ℹ️ Unknown command.𝐏ʟᴇᴀsᴇ 𝐒ᴇɴᴅ  `/help` ।", true);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Internal Server Error");
  }
}

// 🔹 Send Message
async function sendMessage(chatId, text, markdown = false) {
  await fetch(`${API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: markdown ? "Markdown" : undefined,
    }),
  });
}

// 🔹 Channel Membership Check
async function checkMembership(userId) {
  try {
    const url = `${API_URL}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok) return false;
    const status = data.result.status;
    return ["member", "administrator", "creator"].includes(status);
  } catch (e) {
    console.error("Membership check failed:", e);
    return false;
  }
}
