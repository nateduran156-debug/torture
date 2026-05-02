const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the queue"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.tracks.length) return interaction.reply({ embeds: [error(interaction, "The queue is empty.")], ephemeral: true });
    queue.shuffle();
    await interaction.reply({ embeds: [success(interaction, `Shuffled **${queue.tracks.length}** tracks.`)] });
  },
};
