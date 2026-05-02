const { getGuildConfig, getReactionRoles, getStarboard, saveStarboard } = require("../utils/database");
const { base } = require("../utils/embed");

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return;
    if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
    if (reaction.message.partial) { try { await reaction.message.fetch(); } catch { return; } }

    const guild = reaction.message.guild;
    if (!guild) return;

    // --- Reaction Roles ---
    const rr = getReactionRoles(guild.id);
    const msgRoles = rr[reaction.message.id];
    if (msgRoles) {
      const roleId = msgRoles[reaction.emoji.name] ?? msgRoles[reaction.emoji.toString()];
      if (roleId) {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (member) await member.roles.add(roleId).catch(() => {});
      }
    }

    // --- Starboard & Clownboard ---
    const cfg = getGuildConfig(guild.id);
    const emojiStr = reaction.emoji.name ?? reaction.emoji.toString();

    for (const [boardKey, channelKey, emojiKey, threshKey, lockedKey] of [
      ["starboard", "starboardChannel", "starboardEmoji", "starboardThreshold", "starboardLocked"],
      ["clownboard", "clownboardChannel", "clownboardEmoji", "clownboardThreshold", "clownboardLocked"],
    ]) {
      if (!cfg[channelKey] || cfg[lockedKey]) continue;
      if (emojiStr !== (cfg[emojiKey] ?? (boardKey === "starboard" ? "⭐" : "🤡"))) continue;
      if (cfg.starboardIgnore?.includes(reaction.message.channel.id)) continue;
      if (cfg.starboardIgnore?.includes(reaction.message.author?.id)) continue;
      if (reaction.message.channel.id === cfg[channelKey]) continue;

      const count = reaction.count;
      const threshold = cfg[threshKey] ?? 3;
      if (count < threshold) continue;

      const boardData = getStarboard(guild.id);
      const key = `${boardKey}_${reaction.message.id}`;

      const boardChannel = guild.channels.cache.get(cfg[channelKey]);
      if (!boardChannel) continue;

      const msg = reaction.message;
      const embed = base(null)
        .setAuthor({ name: msg.author?.tag ?? "Unknown", iconURL: msg.author?.displayAvatarURL({ dynamic: true }) })
        .setDescription(msg.content || null)
        .setColor(boardKey === "starboard" ? 0xffd700 : 0xff4444)
        .addFields({ name: "Source", value: `[Jump to message](${msg.url})` })
        .setTimestamp(msg.createdTimestamp);

      if (msg.attachments.size) {
        const img = msg.attachments.find(a => a.contentType?.startsWith("image/"));
        if (img) embed.setImage(img.url);
      }

      const label = `${cfg[emojiKey] ?? (boardKey === "starboard" ? "⭐" : "🤡")} **${count}** | ${msg.channel}`;

      if (!boardData[key]) {
        const sent = await boardChannel.send({ content: label, embeds: [embed] }).catch(() => null);
        if (sent) { boardData[key] = sent.id; saveStarboard(guild.id, boardData); }
      } else {
        const existing = await boardChannel.messages.fetch(boardData[key]).catch(() => null);
        if (existing) await existing.edit({ content: label, embeds: [embed] }).catch(() => {});
      }
    }
  },
};
