const fs   = require("fs");
const path = require("path");
const config = require("../../config.json");

const dataDir = path.resolve(__dirname, "../../", config.dataPath);

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}
function loadFile(name) {
  ensureDir();
  const file = path.join(dataDir, `${name}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function saveFile(name, data) {
  ensureDir();
  fs.writeFileSync(path.join(dataDir, `${name}.json`), JSON.stringify(data, null, 2));
}

// --- Economy ---
function getEconomy(userId) {
  const db = loadFile("economy");
  if (!db[userId]) db[userId] = { wallet: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastWork: 0, lastBeg: 0, lastCrime: 0, lastRob: 0, inventory: [] };
  return db[userId];
}
function saveEconomy(userId, data) { const db = loadFile("economy"); db[userId] = data; saveFile("economy", db); }

// --- Warnings ---
function getWarnings(guildId, userId) {
  const db = loadFile("warnings");
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId][userId]) db[guildId][userId] = [];
  return db[guildId][userId];
}
function addWarning(guildId, userId, warn) {
  const db = loadFile("warnings");
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId][userId]) db[guildId][userId] = [];
  db[guildId][userId].push(warn);
  saveFile("warnings", db);
  return db[guildId][userId].length;
}
function removeWarning(guildId, userId, index) {
  const db = loadFile("warnings");
  if (!db[guildId]?.[userId]) return false;
  db[guildId][userId].splice(index, 1);
  saveFile("warnings", db);
  return true;
}
function clearWarnings(guildId, userId) {
  const db = loadFile("warnings");
  if (!db[guildId]) db[guildId] = {};
  db[guildId][userId] = [];
  saveFile("warnings", db);
}

// --- Guild config ---
function getGuildConfig(guildId) {
  const db = loadFile("guilds");
  if (!db[guildId]) db[guildId] = {
    prefix: "-", welcomeChannel: null, goodbyeChannel: null, boostChannel: null,
    welcomeMessage: null, goodbyeMessage: null, boostMessage: null,
    logChannels: {}, autorole: null, levelEnabled: false, levelChannel: null,
    levelIgnore: [], levelRewards: [], staffRoles: [], djRole: null,
    autoplay: false, jailChannel: null, jailRole: null, mutedRole: null,
    imageMutedRole: null, reactionMutedRole: null, aliases: {},
    bumpReminder: null, lastBump: 0, starboardChannel: null, starboardThreshold: 3,
    starboardEmoji: "⭐", starboardLocked: false, clownboardChannel: null,
    clownboardThreshold: 3, clownboardEmoji: "🤡", clownboardLocked: false,
    starboardIgnore: [], antinuke: { enabled: false, threshold: 5, action: "ban" },
    boosterRoleBase: null, ticketPanels: [], vmCategory: null, vmJoinChannel: null,
    logIgnore: [],
  };
  return db[guildId];
}
function saveGuildConfig(guildId, data) { const db = loadFile("guilds"); db[guildId] = data; saveFile("guilds", db); }

// --- XP / Levels ---
function getLevel(guildId, userId) {
  const db = loadFile("levels");
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId][userId]) db[guildId][userId] = { xp: 0, level: 0, lastMessage: 0 };
  return db[guildId][userId];
}
function saveLevel(guildId, userId, data) { const db = loadFile("levels"); if (!db[guildId]) db[guildId] = {}; db[guildId][userId] = data; saveFile("levels", db); }
function getLevelLeaderboard(guildId) {
  const db = loadFile("levels");
  if (!db[guildId]) return [];
  return Object.entries(db[guildId]).sort((a, b) => (b[1].level * 10000 + b[1].xp) - (a[1].level * 10000 + a[1].xp)).slice(0, 10).map(([id, data]) => ({ id, ...data }));
}

// --- Giveaways ---
function getGiveaways() { return loadFile("giveaways"); }
function saveGiveaways(data) { saveFile("giveaways", data); }

// --- Reminders ---
function getReminders(userId) { const db = loadFile("reminders"); if (!db[userId]) db[userId] = []; return db[userId]; }
function saveReminders(userId, data) { const db = loadFile("reminders"); db[userId] = data; saveFile("reminders", db); }

// --- Todos ---
function getTodos(userId) { const db = loadFile("todos"); if (!db[userId]) db[userId] = []; return db[userId]; }
function saveTodos(userId, data) { const db = loadFile("todos"); db[userId] = data; saveFile("todos", db); }

// --- Last.fm ---
function getLastfm(userId) { const db = loadFile("lastfm"); return db[userId] ?? null; }
function setLastfm(userId, username) { const db = loadFile("lastfm"); db[userId] = username; saveFile("lastfm", db); }
function removeLastfm(userId) { const db = loadFile("lastfm"); delete db[userId]; saveFile("lastfm", db); }
function getAllLastfm() { return loadFile("lastfm"); }

// --- Reaction Roles ---
function getReactionRoles(guildId) { const db = loadFile("reactionroles"); return db[guildId] ?? {}; }
function saveReactionRoles(guildId, data) { const db = loadFile("reactionroles"); db[guildId] = data; saveFile("reactionroles", db); }

// --- Button Roles ---
function getButtonRoles(guildId) { const db = loadFile("buttonroles"); return db[guildId] ?? {}; }
function saveButtonRoles(guildId, data) { const db = loadFile("buttonroles"); db[guildId] = data; saveFile("buttonroles", db); }

// --- Booster Roles ---
function getBoosterRole(guildId, userId) { const db = loadFile("boosterroles"); return db[guildId]?.[userId] ?? null; }
function saveBoosterRole(guildId, userId, roleId) { const db = loadFile("boosterroles"); if (!db[guildId]) db[guildId] = {}; db[guildId][userId] = roleId; saveFile("boosterroles", db); }
function deleteBoosterRole(guildId, userId) { const db = loadFile("boosterroles"); if (db[guildId]) { delete db[guildId][userId]; saveFile("boosterroles", db); } }

// --- Autoresponders ---
function getAutoresponders(guildId) { const db = loadFile("autoresponders"); return db[guildId] ?? []; }
function saveAutoresponders(guildId, data) { const db = loadFile("autoresponders"); db[guildId] = data; saveFile("autoresponders", db); }

// --- Timers ---
function getTimers(guildId) { const db = loadFile("timers"); return db[guildId] ?? []; }
function saveTimers(guildId, data) { const db = loadFile("timers"); db[guildId] = data; saveFile("timers", db); }
function getAllTimers() { return loadFile("timers"); }

// --- Reaction Triggers ---
function getReactionTriggers(guildId) { const db = loadFile("reactiontriggers"); return db[guildId] ?? []; }
function saveReactionTriggers(guildId, data) { const db = loadFile("reactiontriggers"); db[guildId] = data; saveFile("reactiontriggers", db); }

// --- Counters ---
function getCounters(guildId) { const db = loadFile("counters"); return db[guildId] ?? []; }
function saveCounters(guildId, data) { const db = loadFile("counters"); db[guildId] = data; saveFile("counters", db); }
function getAllCounters() { return loadFile("counters"); }

// --- Tickets ---
function getTickets(guildId) { const db = loadFile("tickets"); return db[guildId] ?? { panels: [], openTickets: {} }; }
function saveTickets(guildId, data) { const db = loadFile("tickets"); db[guildId] = data; saveFile("tickets", db); }

// --- Tempbans ---
function getTempbans() { return loadFile("tempbans"); }
function saveTempbans(data) { saveFile("tempbans", data); }

// --- Jail ---
function getJailed(guildId) { const db = loadFile("jailed"); return db[guildId] ?? {}; }
function saveJailed(guildId, data) { const db = loadFile("jailed"); db[guildId] = data; saveFile("jailed", db); }

// --- Starboard ---
function getStarboard(guildId) { const db = loadFile("starboard"); return db[guildId] ?? {}; }
function saveStarboard(guildId, data) { const db = loadFile("starboard"); db[guildId] = data; saveFile("starboard", db); }

// --- Social feeds ---
function getSocialFeeds(guildId) { const db = loadFile("socialfeeds"); return db[guildId] ?? []; }
function saveSocialFeeds(guildId, data) { const db = loadFile("socialfeeds"); db[guildId] = data; saveFile("socialfeeds", db); }

// --- VoiceMaster temp channels ---
function getTempChannels() { return loadFile("tempchannels"); }
function saveTempChannels(data) { saveFile("tempchannels", data); }

// --- AFK ---
function getAfk(userId) { const db = loadFile("afk"); return db[userId] ?? null; }
function setAfk(userId, data) { const db = loadFile("afk"); db[userId] = data; saveFile("afk", db); }
function removeAfk(userId) { const db = loadFile("afk"); delete db[userId]; saveFile("afk", db); }
function getAllAfk() { return loadFile("afk"); }

// --- Tracking ---
function getTracking(guildId) {
  const db = loadFile("tracking");
  if (!db[guildId]) db[guildId] = { enabled: false, users: {} };
  return db[guildId];
}
function saveTracking(guildId, data) { const db = loadFile("tracking"); db[guildId] = data; saveFile("tracking", db); }

// --- Ignore ---
function getIgnore(guildId) {
  const db = loadFile("ignore");
  if (!db[guildId]) db[guildId] = { channels: [], users: [], commands: [], bypass: [] };
  return db[guildId];
}
function saveIgnore(guildId, data) { const db = loadFile("ignore"); db[guildId] = data; saveFile("ignore", db); }

// --- Sticky Messages ---
function getSticky(guildId) { const db = loadFile("sticky"); return db[guildId] ?? {}; }
function saveSticky(guildId, data) { const db = loadFile("sticky"); db[guildId] = data; saveFile("sticky", db); }

// --- Counting ---
function getCounting(guildId) {
  const db = loadFile("counting");
  if (!db[guildId]) db[guildId] = { channelId: null, count: 0, lastUserId: null, failed: false };
  return db[guildId];
}
function saveCounting(guildId, data) { const db = loadFile("counting"); db[guildId] = data; saveFile("counting", db); }

module.exports = {
  loadFile, saveFile,
  getEconomy, saveEconomy,
  getWarnings, addWarning, removeWarning, clearWarnings,
  getGuildConfig, saveGuildConfig,
  getLevel, saveLevel, getLevelLeaderboard,
  getGiveaways, saveGiveaways,
  getReminders, saveReminders,
  getTodos, saveTodos,
  getLastfm, setLastfm, removeLastfm, getAllLastfm,
  getReactionRoles, saveReactionRoles,
  getButtonRoles, saveButtonRoles,
  getBoosterRole, saveBoosterRole, deleteBoosterRole,
  getAutoresponders, saveAutoresponders,
  getTimers, saveTimers, getAllTimers,
  getReactionTriggers, saveReactionTriggers,
  getCounters, saveCounters, getAllCounters,
  getTickets, saveTickets,
  getTempbans, saveTempbans,
  getJailed, saveJailed,
  getStarboard, saveStarboard,
  getSocialFeeds, saveSocialFeeds,
  getTempChannels, saveTempChannels,
  getAfk, setAfk, removeAfk, getAllAfk,
  getTracking, saveTracking,
  getIgnore, saveIgnore,
  getSticky, saveSticky,
  getCounting, saveCounting,
};
