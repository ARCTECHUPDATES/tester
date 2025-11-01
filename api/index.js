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
        `🚫 *Access Denied!*\nपहले हमारे channel को join करें:\n👉 ${CHANNEL_USERNAME}`,
        true
      );
      return res.status(200).send("User not joined");
    }

    // 🟢 /start command
    if (text === "/start") {
      await sendMessage(
        chatId,
        `👋 *Welcome to Lookup Bot!*\n\nकृपया नीचे दिए गए commands का इस्तेमाल करें:\n\n🔍 /info <number> — मोबाइल डेटा खोजने के लिए\nℹ️ /help — मदद के लिए`,
        true
      );
    }

    // 🟢 /help command
    else if (text === "/help") {
      await sendMessage(
        chatId,
        `🧾 *Bot Commands:*\n\n/start — बॉट शुरू करने के लिए\n/help — इस list को देखने के लिए\n/info <number> — मोबाइल डेटा खोजने के लिए\n\n⚠️ पहले हमारे चैनल ${CHANNEL_USERNAME} को join करें।`,
        true
      );
    }

    // 🟢 /info command
    else if (text.startsWith("/info")) {
      const parts = text.split(" ");
      if (parts.length < 2) {
        await sendMessage(chatId, "❗ कृपया इस format में भेजें:\n`/info 9876543210`", true);
      } else {
        const number = parts[1].trim();
        if (!/^\d{10}$/.test(number)) {
          await sendMessage(chatId, "📩 कृपया valid 10-digit mobile number भेजें।", true);
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
            await sendMessage(chatId, "❌ कोई डेटा नहीं मिला।", true);
          }
        }
      }
    }

    // ❓ Unknown text
    else {
      await sendMessage(chatId, "ℹ️ Unknown command. कृपया `/help` टाइप करें।", true);
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
