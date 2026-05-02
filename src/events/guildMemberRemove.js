const { getGuildConfig } = require("../utils/database");
const { base } = require("../utils/embed");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    const cfg = getGuildConfig(member.guild.id);

    // Goodbye message
    if (cfg.goodbyeChannel) {
      const channel = member.guild.channels.cache.get(cfg.goodbyeChannel);
      if (channel) {
        const message = (cfg.goodbyeMessage ?? "**{user}** has left **{server}**. Goodbye!")
          .replace("{user}", member.user.username)
          .replace("{server}", member.guild.name)
          .replace("{tag}", member.user.tag);

        const embed = base(null)
          .setDescription(message)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setColor(0x2b2d31);

        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // Member leave log
    const logCh = cfg.logChannels?.members ? member.guild.channels.cache.get(cfg.logChannels.members) : null;
    if (logCh) {
      const embed = base(null)
        .setTitle("Member Left")
        .setColor(0xe74c3c)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "User", value: `${member.user.tag} (<@${member.id}>)`, inline: true },
          { name: "Joined", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown", inline: true },
          { name: "Members", value: `${member.guild.memberCount}`, inline: true },
        )
        .setTimestamp();
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  },
};
