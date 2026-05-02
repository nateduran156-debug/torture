const { getGuildConfig } = require("../utils/database");
const { base } = require("../utils/embed");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const cfg = getGuildConfig(member.guild.id);

    // Autorole
    if (cfg.autorole) {
      const role = member.guild.roles.cache.get(cfg.autorole);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // Welcome message
    if (cfg.welcomeChannel) {
      const channel = member.guild.channels.cache.get(cfg.welcomeChannel);
      if (channel) {
        const message = (cfg.welcomeMessage ?? "Welcome to **{server}**, {user}! You are member #{count}.")
          .replace("{user}", member.toString())
          .replace("{user.mention}", member.toString())
          .replace("{server}", member.guild.name)
          .replace("{guild}", member.guild.name)
          .replace("{guild.name}", member.guild.name)
          .replace("{count}", member.guild.memberCount)
          .replace("{username}", member.user.username);

        const embed = base(null)
          .setTitle(`Welcome to ${member.guild.name}!`)
          .setDescription(message)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setColor(0x2b2d31);

        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // Member join log
    const logCh = cfg.logChannels?.members ? member.guild.channels.cache.get(cfg.logChannels.members) : null;
    if (logCh) {
      const embed = base(null)
        .setTitle("Member Joined")
        .setColor(0x2ecc71)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "User", value: `${member.user.tag} (<@${member.id}>)`, inline: true },
          { name: "Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: "Members", value: `${member.guild.memberCount}`, inline: true },
        )
        .setTimestamp();
      await logCh.send({ embeds: [embed] }).catch(() => {});
    }
  },
};
