const { getGuildConfig, getLevel, saveLevel, getAutoresponders, getReactionTriggers } = require("../utils/database");
const { base } = require("../utils/embed");
const config = require("../../config.json");
const { xpForLevel } = require("../utils/permissions");

const DISBOARD_ID = "302050872383242240";

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (!message.guild) return;

    // Store snipe data
    message.client.snipes = message.client.snipes ?? new Map();

    // --- Bump Reminder detection ---
    if (message.author.id === DISBOARD_ID && message.embeds.length > 0) {
      const embed = message.embeds[0];
      if (embed.description?.includes("Bump done")) {
        const cfg = getGuildConfig(message.guild.id);
        if (cfg.bumpReminder?.channelId) {
          const ch = message.guild.channels.cache.get(cfg.bumpReminder.channelId);
          if (ch) {
            const roleId = cfg.bumpReminder.roleId;
            setTimeout(async () => {
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

    const cfg = getGuildConfig(message.guild.id);

    // --- Auto Responders ---
    const autoresponders = getAutoresponders(message.guild.id);
    for (const ar of autoresponders) {
      const matches = ar.wildcard
        ? message.content.toLowerCase().includes(ar.trigger)
        : message.content.toLowerCase() === ar.trigger;

      if (matches) {
        const sent = await message.channel.send(ar.response).catch(() => null);
        if (sent && ar.selfDestruct) {
          setTimeout(() => sent.delete().catch(() => {}), ar.selfDestruct * 1000);
        }
        break;
      }
    }

    // --- Reaction Triggers ---
    const triggers = getReactionTriggers(message.guild.id);
    for (const t of triggers) {
      if (message.content.toLowerCase().includes(t.trigger)) {
        await message.react(t.emoji).catch(() => {});
      }
    }

    // --- XP / Leveling ---
    if (!cfg.levelEnabled) return;

    const data = getLevel(message.guild.id, message.author.id);
    const now = Date.now();
    if (now - data.lastMessage < config.xp.cooldown) return;

    data.xp += config.xp.perMessage;
    data.lastMessage = now;

    const needed = xpForLevel(data.level);
    if (data.xp >= needed) {
      data.level += 1;
      data.xp = 0;
      saveLevel(message.guild.id, message.author.id, data);

      const levelRewards = cfg.levelRewards ?? [];
      const reward = levelRewards.find(r => r.level === data.level);
      if (reward) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (role) await message.member.roles.add(role).catch(() => {});
      }

      const announceCh = cfg.levelChannel ? message.guild.channels.cache.get(cfg.levelChannel) : message.channel;
      if (announceCh) {
        const embed = base(null)
          .setDescription(`🎉 ${message.author} reached **Level ${data.level}**!`)
          .setColor(0xffd700);
        announceCh.send({ embeds: [embed] }).catch(() => {});
      }
    } else {
      saveLevel(message.guild.id, message.author.id, data);
    }
  },
};
