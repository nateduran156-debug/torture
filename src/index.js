require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { getTempbans, saveTempbans, getAllTimers, saveTimers } = require("./utils/database");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
});

client.commands = new Collection();
client.snipes = new Map();
client.editSnipes = new Map();

function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommands(full);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      try {
        const command = require(full);
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          console.log(`[cmd] Loaded: /${command.data.name}`);
        }
      } catch (e) {
        console.error(`[cmd] Failed to load ${full}:`, e.message);
      }
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

const eventsDir = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith(".js"))) {
  try {
    const event = require(path.join(eventsDir, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  } catch (e) {
    console.error(`[event] Failed to load ${file}:`, e.message);
  }
}

// Restore active tempbans on startup
function restoreTempbans() {
  const bans = getTempbans();
  const now = Date.now();
  let changed = false;
  for (const [key, ban] of Object.entries(bans)) {
    const remaining = ban.unbanAt - now;
    if (remaining <= 0) {
      client.guilds.cache.get(ban.guildId)?.members.unban(ban.userId, "Tempban expired").catch(() => {});
      delete bans[key];
      changed = true;
    } else {
      setTimeout(async () => {
        try {
          const guild = await client.guilds.fetch(ban.guildId);
          await guild.members.unban(ban.userId, "Tempban expired");
        } catch {}
        const updated = getTempbans();
        delete updated[key];
        saveTempbans(updated);
      }, remaining);
    }
  }
  if (changed) saveTempbans(bans);
}

// Auto-message timer tick (every 60 seconds)
function startTimerTick() {
  setInterval(async () => {
    const allTimers = getAllTimers();
    const now = Date.now();
    let changed = false;

    for (const [guildId, timers] of Object.entries(allTimers)) {
      for (const timer of timers) {
        if (now >= timer.nextSend) {
          try {
            const ch = await client.channels.fetch(timer.channelId);
            await ch.send(timer.message);
          } catch {}
          timer.nextSend = now + timer.interval;
          changed = true;
        }
      }
      if (changed) saveTimers(guildId, timers);
    }
  }, 60 * 1000);
}

client.once("ready", () => {
  restoreTempbans();
  startTimerTick();
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("[error] DISCORD_BOT_TOKEN is not set in .env");
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
