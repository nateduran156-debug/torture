const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("View the most recently deleted message in this channel"),

  async execute(interaction) {
    const snipes = interaction.client.snipes ?? new Map();
    const snipe = snipes.get(interaction.channel.id);

    if (!snipe) return interaction.reply({ embeds: [info(interaction, null, "There are no recently deleted messages in this channel.")], ephemeral: true });

    const embed = base(interaction)
      .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(snipe.content || "*No text content*")
      .setTimestamp(snipe.deletedAt);

    if (snipe.image) embed.setImage(snipe.image);

    await interaction.reply({ embeds: [embed] });
  },
};
