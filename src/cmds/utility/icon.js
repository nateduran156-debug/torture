const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("icon")
    .setDescription("View the server icon"),

  async execute(interaction) {
    const icon = interaction.guild.iconURL({ dynamic: true, size: 4096 });
    if (!icon) return interaction.reply({ embeds: [info(interaction, null, "This server has no icon.")] });

    const embed = base(interaction)
      .setTitle(`${interaction.guild.name}'s icon`)
      .setImage(icon)
      .setURL(icon)
      .setDescription(`[Open in browser](${icon})`);

    await interaction.reply({ embeds: [embed] });
  },
};
