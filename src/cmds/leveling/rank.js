const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");
const { getLevel } = require("../../utils/database");
const { xpForLevel } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("View your or someone's rank card")
    .addUserOption(o => o.setName("user").setDescription("User to check")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const data = getLevel(interaction.guild.id, user.id);
    const needed = xpForLevel(data.level);

    const progress = Math.min(Math.floor((data.xp / needed) * 20), 20);
    const bar = "█".repeat(progress) + "░".repeat(20 - progress);

    const embed = base(interaction)
      .setTitle(`${user.username}'s Rank`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Level", value: `${data.level}`, inline: true },
        { name: "XP", value: `${data.xp} / ${needed}`, inline: true },
      )
      .setDescription(`\`${bar}\``);

    await interaction.reply({ embeds: [embed] });
  },
};
