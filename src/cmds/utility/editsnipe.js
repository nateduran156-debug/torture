const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editsnipe")
    .setDescription("View the most recently edited message in this channel"),

  async execute(interaction) {
    const editSnipes = interaction.client.editSnipes ?? new Map();
    const snipe = editSnipes.get(interaction.channel.id);

    if (!snipe) return interaction.reply({ embeds: [info(interaction, null, "There are no recently edited messages in this channel.")], ephemeral: true });

    const embed = base(interaction)
      .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(`**Before:**\n${snipe.before || "*No text*"}\n\n**After:**\n${snipe.after || "*No text*"}`)
      .setTimestamp(snipe.editedAt);

    await interaction.reply({ embeds: [embed] });
  },
};
