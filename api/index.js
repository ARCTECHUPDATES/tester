import fetch from "node-fetch";

// --- CONFIG ---
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// --- For Vercel Body Parsing ---
export const config = {
  api: {
    bodyParser: true,
  },
};

// --- HANDLER ---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Bot is running ✅");
  }

  try {
    const body = req.body || {};

    if (!body.message || !body.message.chat || !body.message.text) {
      console.log("⚠️ Invalid body:", body);
      return res.status(200).send("No valid message received");
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    if (text === "/start") {
      await sendMessage(chatId, "👋 Welcome! Please send a mobile number to search.");
    } else if (/^\d{10}$/.test(text)) {
      const response = await fetch(`https://random-remove-batch-tea.trycloudflare.com/search?mobile=${text}`);
      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        let reply = data.data.map((d, i) =>
          `📞 *Mobile:* ${d.mobile || "N/A"}\n👤 *Name:* ${d.name || "N/A"}\n👨‍👦 *Father:* ${d.fname || "N/A"}\n🏠 *Address:* ${d.address || "N/A"}\n📱 *Alternate:* ${d.alt || "N/A"}\n🌐 *Circle:* ${d.circle || "N/A"}\n🆔 *ID:* ${d.id || "N/A"}`
        ).join("\n\n────────────────────\n\n");

        await sendMessage(chatId, reply, true);
      } else {
        await sendMessage(chatId, "❌ कोई डेटा नहीं मिला।");
      }
    } else {
      await sendMessage(chatId, "📩 कृपया valid 10-digit mobile number भेजें।");
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).send("Internal Server Error");
  }
}

// --- FUNCTION TO SEND MESSAGE ---
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
