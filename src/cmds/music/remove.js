const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a track from the queue")
    .addIntegerOption(o => o.setName("position").setDescription("Track position in queue").setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.tracks.length) return interaction.reply({ embeds: [error(interaction, "The queue is empty.")], ephemeral: true });
    const pos = interaction.options.getInteger("position") - 1;
    const removed = queue.remove(pos);
    if (!removed) return interaction.reply({ embeds: [error(interaction, `Invalid position. Queue has **${queue.tracks.length}** tracks.`)], ephemeral: true });
    await interaction.reply({ embeds: [success(interaction, `Removed **${removed.title}** from the queue.`)] });
  },
};
