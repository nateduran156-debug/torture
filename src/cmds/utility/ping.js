const { SlashCommandBuilder } = require("discord.js");
const { info } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency"),

  async execute(interaction) {
    await interaction.deferReply();
    const sent = await interaction.fetchReply();
    const round = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;

    await interaction.editReply({
      embeds: [
        info(interaction, "🏓 Pong!", null, [
          { name: "Roundtrip", value: `${round}ms`, inline: true },
          { name: "WebSocket", value: `${ws}ms`, inline: true },
        ]),
      ],
    });
  },
};
