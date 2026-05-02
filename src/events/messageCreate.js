const {
  getGuildConfig,
  getLevel, saveLevel,
  getAutoresponders,
  getReactionTriggers,
  getAfk, removeAfk, getAllAfk,
  getIgnore,
  getSticky, saveSticky,
  getCounting, saveCounting,
  getTracking, saveTracking,
} = require("../utils/database");
const { base, error } = require("../utils/embed");
const config  = require("../../config.json");
const { xpForLevel } = require("../utils/permissions");
const { PrefixInteraction } = require("../utils/prefixInteraction");

const DISBOARD_ID = "302050872383242240";

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (!message.guild) return;

    message.client.snipes = message.client.snipes ?? new Map();

    // ── Bump Reminder detection ──────────────────────────────────────────
    if (message.author.id === DISBOARD_ID && message.embeds.length > 0) {
      if (message.embeds[0].description?.includes("Bump done")) {
        const cfg = getGuildConfig(message.guild.id);
        if (cfg.bumpReminder?.channelId) {
          const ch = message.guild.channels.cache.get(cfg.bumpReminder.channelId);
          if (ch) {
            setTimeout(async () => {
              const roleId = cfg.bumpReminder.roleId;
              await ch.send({
                content: roleId ? `<@&${roleId}>` : "",
                embeds: [base(null).setDescription("⏰ It's time to bump the server! Use `/bump` on DISBOARD.").setColor(0x5865f2)],
              }).catch(() => {});
            }, 2 * 60 * 60 * 1000);
          }
        }
      }
    }

    if (message.author.bot) return;

    const cfg    = getGuildConfig(message.guild.id);
    const prefix = cfg.prefix ?? "-";

    // ── AFK: clear if sender is AFK ──────────────────────────────────────
    const senderAfk = getAfk(message.author.id);
    if (senderAfk) {
      removeAfk(message.author.id);
      const ago = Math.floor((Date.now() - senderAfk.time) / 60000);
      message.channel.send({
        embeds: [base(null).setDescription(`👋 Welcome back ${message.author}! Removed your AFK (**${ago} min ago**).`).setColor(0x57f287)],
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 6000)).catch(() => {});
    }

    // ── AFK: notify if someone mentions an AFK user ──────────────────────
    if (message.mentions.users.size) {
      const allAfk = getAllAfk();
      for (const [userId, data] of Object.entries(allAfk)) {
        if (message.mentions.users.has(userId)) {
          const ago = Math.floor((Date.now() - data.time) / 60000);
          message.channel.send({
            embeds: [base(null).setDescription(`💤 **${data.username}** is AFK: *${data.reason}* (${ago} min ago)`).setColor(0xfaa61a)],
          }).then(m => setTimeout(() => m.delete().catch(() => {}), 8000)).catch(() => {});
        }
      }
    }

    // ── Counting channel ─────────────────────────────────────────────────
    const countData = getCounting(message.guild.id);
    if (countData.channelId && message.channel.id === countData.channelId) {
      const expected = countData.count + 1;
      const num      = parseInt(message.content.trim(), 10);

      if (isNaN(num) || num !== expected) {
        await message.delete().catch(() => {});
        message.channel.send(`❌ ${message.author} — The next number is **${expected}**!`)
          .then(m => setTimeout(() => m.delete().catch(() => {}), 5000)).catch(() => {});
        return;
      } else if (countData.lastUserId === message.author.id) {
        await message.delete().catch(() => {});
        message.channel.send(`❌ ${message.author} — You can't count twice in a row!`)
          .then(m => setTimeout(() => m.delete().catch(() => {}), 5000)).catch(() => {});
        return;
      } else {
        countData.count      = expected;
        countData.lastUserId = message.author.id;
        saveCounting(message.guild.id, countData);
        if (expected % 100 === 0) await message.react("🎉").catch(() => {});
      }
    }

    // ── Prefix Command Handler (with ignore checks) ──────────────────────
    if (message.content.startsWith(prefix)) {
      const args        = message.content.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();
      if (commandName) {
        const ignoreData = getIgnore(message.guild.id);
        const hasBypass  = ignoreData.bypass.some(id => message.member?.roles?.cache?.has(id));

        const blocked =
          !hasBypass && (
            ignoreData.channels.includes(message.channel.id) ||
            ignoreData.users.includes(message.author.id)     ||
            ignoreData.commands.includes(commandName)
          );

        if (!blocked) {
          const command = message.client.commands.get(commandName)
            ?? message.client.commands.find(c => c.data?.name === commandName);

          if (command) {
            try {
              const interaction = new PrefixInteraction(message, command, args);
              await command.execute(interaction);
            } catch (e) {
              console.error(`[prefix] Error in ${commandName}:`, e.message);
              message.channel.send({ embeds: [error(null, `Something went wrong running \`${prefix}${commandName}\`.`)] }).catch(() => {});
            }
          }
        }
      }
    }

    // ── Auto Responders ──────────────────────────────────────────────────
    const autoresponders = getAutoresponders(message.guild.id);
    for (const ar of autoresponders) {
      const matches = ar.wildcard
        ? message.content.toLowerCase().includes(ar.trigger)
        : message.content.toLowerCase() === ar.trigger;
      if (matches) {
        const sent = await message.channel.send(ar.response).catch(() => null);
        if (sent && ar.selfDestruct) setTimeout(() => sent.delete().catch(() => {}), ar.selfDestruct * 1000);
        break;
      }
    }

    // ── Reaction Triggers ────────────────────────────────────────────────
    const triggers = getReactionTriggers(message.guild.id);
    for (const t of triggers) {
      if (message.content.toLowerCase().includes(t.trigger)) {
        await message.react(t.emoji).catch(() => {});
      }
    }

    // ── Message Tracking ─────────────────────────────────────────────────
    const tracking = getTracking(message.guild.id);
    if (tracking.enabled) {
      if (!tracking.users) tracking.users = {};
      if (!tracking.users[message.author.id]) tracking.users[message.author.id] = { messages: 0 };
      tracking.users[message.author.id].messages++;
      saveTracking(message.guild.id, tracking);
    }

    // ── Sticky messages ──────────────────────────────────────────────────
    await handleSticky(message);

    // ── XP / Leveling ────────────────────────────────────────────────────
    if (!cfg.levelEnabled) return;

    const levelIgnore = cfg.levelIgnore ?? [];
    if (levelIgnore.includes(message.channel.id) || levelIgnore.some(id => message.member?.roles?.cache?.has(id))) return;

    const levelData = getLevel(message.guild.id, message.author.id);
    const now       = Date.now();
    if (now - levelData.lastMessage < config.xp.cooldown) return;

    levelData.xp         += config.xp.perMessage;
    levelData.lastMessage  = now;

    const needed = xpForLevel(levelData.level);
    if (levelData.xp >= needed) {
      levelData.level += 1;
      levelData.xp     = 0;
      saveLevel(message.guild.id, message.author.id, levelData);

      const reward = (cfg.levelRewards ?? []).find(r => r.level === levelData.level);
      if (reward) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (role) await message.member.roles.add(role).catch(() => {});
      }

      const announceCh = cfg.levelChannel
        ? message.guild.channels.cache.get(cfg.levelChannel)
        : message.channel;
      if (announceCh) {
        announceCh.send({
          embeds: [base(null).setDescription(`🎉 ${message.author} reached **Level ${levelData.level}**!`).setColor(0xffd700)],
        }).catch(() => {});
      }
    } else {
      saveLevel(message.guild.id, message.author.id, levelData);
    }
  },
};

// ── Sticky helper ────────────────────────────────────────────────────────────
async function handleSticky(message) {
  const guildSticky = getSticky(message.guild.id);
  const entry       = guildSticky[message.channel.id];
  if (!entry) return;
  if (message.id === entry.lastMessageId) return;

  if (entry.lastMessageId) {
    const old = await message.channel.messages.fetch(entry.lastMessageId).catch(() => null);
    if (old && old.deletable) await old.delete().catch(() => {});
  }

  const sent = await message.channel.send(`📌 **Sticky:** ${entry.content}`).catch(() => null);
  if (sent) {
    guildSticky[message.channel.id].lastMessageId = sent.id;
    saveSticky(message.guild.id, guildSticky);
  }
}
