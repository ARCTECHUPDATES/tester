import fetch from "node-fetch";

const BOT_TOKEN = "7996568178:AAHlA9KKsxC0umMzrArlhYIMHwN_2B89EPI"; // 🔹 Yahan apna bot token daalo
const CHANNEL_USERNAME = "@ABOUT_JALLAD_PAPA"; // 🔹 Jis channel ko join karna mandatory hai

const API_URL = "https://random-remove-batch-tea.trycloudflare.com/search?mobile=";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ✅ Function to send message
async function sendMessage(chatId, text, options = {}) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
      ...options,
    }),
  });
}

// ✅ Function to check if user joined channel
async function isUserJoined(userId) {
  const res = await fetch(`${TELEGRAM_API}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`);
  const data = await res.json();
  if (!data.ok) return false;
  const status = data.result.status;
  return ["creator", "administrator", "member"].includes(status);
}

// ✅ Main webhook handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("✅ Telegram bot is running...");
  }

  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) return res.status(200).end();

    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text.trim();

    // 🔹 /start command
    if (text === "/start") {
      const joined = await isUserJoined(userId);

      if (!joined) {
        return sendMessage(
          chatId,
          `🚫 *Please join our channel first:*\n👉 ${CHANNEL_USERNAME}`
        );
      }

      return sendMessage(
        chatId,
        `👋 *Welcome!* Send me a mobile number like:\n\n/get 8874351881`
      );
    }

    // 🔹 /get <mobile> command
    if (text.startsWith("/get")) {
      const joined = await isUserJoined(userId);

      if (!joined) {
        return sendMessage(
          chatId,
          `⚠️ *Please join ${CHANNEL_USERNAME} first to use this command.*`
        );
      }

      const parts = text.split(" ");
      if (parts.length < 2) {
        return sendMessage(chatId, "❗ Please provide a mobile number.\nExample: `/get 9876543210`");
      }

      const mobile = parts[1];
      const response = await fetch(API_URL + mobile);
      const data = await response.json();

      if (!data || !data.data || data.data.length === 0) {
        return sendMessage(chatId, "❌ No data found for this number.");
      }

      // 🔹 Format output
      const formatted = data.data.map((item, i) => {
        return (
          `📱 *Result ${i + 1}*\n` +
          `👤 Full Name: ${item.name || "N/A"}\n` +
          `👨‍👦 Father Name: ${item.fname || "N/A"}\n` +
          `🏠 Address: ${item.address ? item.address.replace(/!/g, ", ") : "N/A"}\n` +
          `📞 Mobile: ${item.mobile || "N/A"}\n` +
          `📞 Alternate: ${item.alt || "N/A"}\n` +
          `🌐 Circle: ${item.circle || "N/A"}\n` +
          `🆔 ID: ${item.id || "N/A"}\n`
        );
      }).join("\n──────────────────────────\n");

      return sendMessage(chatId, formatted);
    }

    res.status(200).end();
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Bot Error: " + err.message);
  }
}
