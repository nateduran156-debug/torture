const { getGuildConfig } = require("../utils/database");
const { base } = require("../utils/embed");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {
    const guild = newMember.guild;
    const cfg = getGuildConfig(guild.id);

    // Boost message
    const wasBooster = !!oldMember.premiumSince;
    const isBooster = !!newMember.premiumSince;

    if (!wasBooster && isBooster && cfg.boostChannel) {
      const ch = guild.channels.cache.get(cfg.boostChannel);
      if (ch) {
        const msg = (cfg.boostMessage ?? "🎉 **{user}** just boosted **{server}**! Thank you so much!")
          .replace("{user}", newMember.toString())
          .replace("{server}", guild.name)
          .replace("{username}", newMember.user.username);

        const embed = base(null)
          .setTitle(`${guild.name} was boosted!`)
          .setDescription(msg)
          .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
          .setColor(0xff73fa);

        await ch.send({ embeds: [embed] }).catch(() => {});
      }
    }
  },
};
