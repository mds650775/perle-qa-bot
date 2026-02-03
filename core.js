const axios = require("axios");
const cheerio = require("cheerio");
const { TwitterApi } = require("twitter-api-v2");
const { CONFIG } = require("./config");
const { saveFeedback } = require("./db");

/* -------------------- HELPERS -------------------- */

function normalize(text = "") {
  return text.toLowerCase().trim();
}

function isGreeting(text) {
  return /^(hi|hey|yo|hello|hey bro|yo hi|hi bro|hey man)/i.test(text);
}

function isOffTopic(text) {
  return !text.includes("perle");
}

function cleanOutput(text) {
  return text
    .replace(/[*#>`_]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function randomJoke() {
  const jokes = [
  "Are you dumb? I said ask about Perle Labs only.",
  "Bro, you can't read? Perle Labs questions only.",
  "Out of your mind? Wrong topic. Perle or gtfo.",
  "Not Perle-related. Try again when you have a real question.",
  "You really just asked that? Perle Labs only, genius.",
  "Stop wasting my time. Perle Labs or I'm done.",
  "Wrong bot. Go bother someone else with that nonsense.",
  "Perle Labs only. Don't test me.",
  "You got some nerve. Perle or nothing.",
  "Nah, not today. Perle Labs questions.",
  "Brain not working? Perle Labs only.",
  "Not even close. Perle Labs.",
  "Do I look like Google? Perle only.",
  "You're killing me. Perle Labs. That's the rule.",
  "Off-topic. Next one better be Perle.",
  "I'm not in the mood for this. Perle Labs.",
  "Read the bio. Perle Labs. Period.",
  "Not gonna entertain that. Perle Labs.",
  "Wrong vibe. Perle or bye.",
  "You serious? Perle Labs only.",
  "Not Perle. Try again.",
  "Focus — Perle Labs.",
  "No. Just no. Perle.",
  "Try harder. Perle Labs.",
  "I see you're still confused. Perle only.",
  "Stop. Perle Labs.",
  "Wrong chat. Perle Labs.",
  "Not even gonna reply to that. Perle.",
  "Perle Labs or get lost.",
  "You can't be serious. Perle only.",
  ];

  return jokes[Math.floor(Math.random() * jokes.length)];
}


/* -------------------- SOURCES -------------------- */

async function fetchPage(url) {
  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);
    return $("body").text().replace(/\s+/g, " ").trim();
  } catch (e) {
    return "";
  }
}

async function fetchPerleSources() {
  const urls = [
    "https://www.perle.xyz/",
    "https://www.perle.xyz/about",
    "https://www.perle.xyz/how-it-works",
    "https://www.perle.xyz/blog",
    "https://perle.gitbook.io/perle-docs"
  ];

  const results = await Promise.all(urls.map(fetchPage));
  return results.filter(Boolean).slice(0, 5).join("\n\n");
}


/* -------------------- GROK -------------------- */

async function callGrok(prompt) {
  const res = await axios.post(
    CONFIG.OPENROUTER_API_URL,
    {
      model: "x-ai/grok-4.1-fast",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    },
    {
      headers: {
        Authorization: `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/yourusername/perle-qa-bot",
        "X-Title": "Perle Q&A Bot by @mds650775_2"
      }
    }
  );

  return res.data.choices[0].message.content;
}

/* -------------------- MAIN -------------------- */

async function getAnswer(question) {
  const q = normalize(question);

  // Greeting
  if (isGreeting(q)) {
    return "Hey 👋 I’m the Perle Labs bot. Ask me anything about Perle Labs.";
  }

  // Off-topic
  if (isOffTopic(q)) {
    return randomJoke();
  }

  // Fetch official data
const sources = await fetchPerleSources();
const tweets = ""; // Twitter search disabled


  const prompt = `
You are the official Perle Labs Q&A Bot.

IMPORTANT IDENTITY:
Perle Labs refers ONLY to the crypto/Web3 project associated with:
- Website: https://www.perle.xyz
- X (Twitter): @PerleLabs
- Blog: https://www.perle.xyz/blog
- Docs: https://perle.gitbook.io/perle-docs
- LinkedIn: https://www.linkedin.com/company/perle-ai
- Linktree: https://linktr.ee/perlelabs

Rules:
- Do NOT confuse with any other "Perle" company.
- Do NOT invent products, chains, tokens, or launches.
- If info is not in the sources, say so clearly.
- Use simple language. No markdown.

OFFICIAL SOURCES:
${sources}

X CONTEXT:
${tweets}

QUESTION:
${question}
`;

  try {
    const raw = await callGrok(prompt);
    return (
      cleanOutput(raw) +
      "\n\n— Insights powered by X - @mds650775_2 & Dc - @mds650775 – Perle contributor"
    );
  } catch (e) {
    return "Something went wrong. Please try again later.";
  }
}

/* -------------------- FEEDBACK -------------------- */

async function storeRating(question, answer, rating) {
  try {
    await saveFeedback({ question, answer, rating });
  } catch {}
}

module.exports = {
  getAnswer,
  storeRating
};




