const { getGuildConfig } = require("../utils/database");

module.exports = {
  name: "channelCreate",
  async execute(channel) {
    if (!channel.guild) return;
    const cfg = getGuildConfig(channel.guild.id);
    if (!cfg.mutedRole && !cfg.imageMutedRole && !cfg.reactionMutedRole) return;

    if (cfg.mutedRole) {
      const role = channel.guild.roles.cache.get(cfg.mutedRole);
      if (role) await channel.permissionOverwrites.create(role, { SendMessages: false, AddReactions: false }).catch(() => {});
    }
    if (cfg.imageMutedRole) {
      const role = channel.guild.roles.cache.get(cfg.imageMutedRole);
      if (role) await channel.permissionOverwrites.create(role, { AttachFiles: false, EmbedLinks: false }).catch(() => {});
    }
    if (cfg.reactionMutedRole) {
      const role = channel.guild.roles.cache.get(cfg.reactionMutedRole);
      if (role) await channel.permissionOverwrites.create(role, { AddReactions: false }).catch(() => {});
    }
  },
};
