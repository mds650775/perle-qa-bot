const { Client, GatewayIntentBits } = require("discord.js");
const { Telegraf } = require("telegraf");
const { CONFIG } = require("./config");
const { getAnswer } = require("./core");

// -------------------- DISCORD BOT --------------------

if (CONFIG.DISCORD_TOKEN) {
  const { Client, GatewayIntentBits, Partials } = require("discord.js");

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages // ✅ REQUIRED FOR DM
  ],
  partials: [Partials.Channel] // ✅ REQUIRED FOR DM
});


  discordClient.on("ready", () => {
    console.log(`Discord bot logged in as ${discordClient.user.tag}`);
  });

discordClient.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isDM = message.channel.type === 1; // DM
  const isMentioned = message.mentions.has(discordClient.user);
  const isCommand = message.content.startsWith("!perle");

  if (!isDM && !isMentioned && !isCommand) return;

  let question = message.content;

  if (isCommand) {
    question = question.replace("!perle", "").trim();
  }

  if (isMentioned) {
    question = question.replace(`<@${discordClient.user.id}>`, "").trim();
  }

  if (!question) return;

  const answer = await getAnswer(question);
  await message.reply(answer);
});


  discordClient.login(CONFIG.DISCORD_TOKEN);
}

// -------------------- TELEGRAM BOT --------------------

if (CONFIG.TELEGRAM_TOKEN) {
  const bot = new Telegraf(CONFIG.TELEGRAM_TOKEN);

  bot.on("text", async (ctx) => {
    const question = ctx.message.text;
    const answer = await getAnswer(question);
    await ctx.reply(answer);
  });

  bot.launch();
  console.log("Telegram bot started");
}

// -------------------- SAFETY --------------------

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

// -------------------- RAILWAY KEEP-ALIVE --------------------
const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Perle Q&A Bot is alive");
}).listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});
