require("dotenv").config();

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || ""
};
