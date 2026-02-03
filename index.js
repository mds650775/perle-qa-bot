// ================== START ==================
console.log("🚀 Perle Q&A Bot starting...");

// ---------- CONFIG ----------
const CONFIG = require("./config");
const { getAnswer } = require("./core");

// ---------- DISCORD ----------
if (CONFIG.DISCORD_TOKEN) {
  const { Client, GatewayIntentBits, Partials } = require("discord.js");

  const discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
  });

  discordClient.once("ready", () => {
    console.log(`✅ Discord logged in as ${discordClient.user.tag}`);
  });

  discordClient.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      const isDM = message.channel.type === 1;
      const isMention = message.mentions.has(discordClient.user);
      const isCommand = message.content.toLowerCase().startsWith("!perle");

      if (!isDM && !isMention && !isCommand) return;

      let question = message.content;

      if (isCommand) {
        question = question.replace(/^!perle/i, "").trim();
      }

      if (isMention) {
        question = question.replace(`<@${discordClient.user.id}>`, "").trim();
      }

      if (!question) return;

      const answer = await getAnswer(question);
      await message.reply(answer);

    } catch (err) {
      console.error("❌ Discord error:", err);
    }
  });

  discordClient.login(CONFIG.DISCORD_TOKEN);
}

// ---------- TELEGRAM ----------
if (CONFIG.TELEGRAM_TOKEN) {
  const { Telegraf } = require("telegraf");

  const bot = new Telegraf(CONFIG.TELEGRAM_TOKEN);

  bot.on("text", async (ctx) => {
    try {
      const question = ctx.message.text;
      const answer = await getAnswer(question);
      await ctx.reply(answer);
    } catch (err) {
      console.error("❌ Telegram error:", err);
    }
  });

  bot.launch();
  console.log("✅ Telegram bot started");
}

// ---------- GRACEFUL SHUTDOWN ----------
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

// ---------- RAILWAY KEEP-ALIVE ----------
const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Perle Q&A Bot is alive");
}).listen(PORT, () => {
  console.log(`🌐 Keep-alive server running on port ${PORT}`);
});
// ================== END ==================
