const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder().setName("clearqueue").setDescription("Clear all tracks from the queue"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.tracks.length) return interaction.reply({ embeds: [error(interaction, "The queue is already empty.")], ephemeral: true });
    const count = queue.tracks.length;
    queue.tracks = [];
    await interaction.reply({ embeds: [success(interaction, `Cleared **${count}** track(s) from the queue.`)] });
  },
};
