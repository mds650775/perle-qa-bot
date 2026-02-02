const dotenv = require("dotenv");

// Load .env file
dotenv.config();

const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,

  TWITTER_BEARER: process.env.TWITTER_BEARER,

  GROK_API_KEY: process.env.GROK_API_KEY,
  GROK_API_URL:
    process.env.GROK_API_URL ||
    "https://openrouter.ai/api/v1/chat/completions",

  SQLITE_DB: process.env.SQLITE_DB || "feedback.db",

  ASK_TEAM_LINK:
    process.env.ASK_TEAM_LINK ||
    "https://discord.com/channels/140825781786357912/140825784789475399"
};

module.exports = { CONFIG };
