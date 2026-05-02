const { SlashCommandBuilder } = require("discord.js");
const { info } = require("../../utils/embed");
const { formatDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Check how long the bot has been online"),

  async execute(interaction) {
    const ms = interaction.client.uptime;
    await interaction.reply({
      embeds: [
        info(interaction, null, `The bot has been online for **${formatDuration(ms)}**.`),
      ],
    });
  },
};
