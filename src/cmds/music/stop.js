const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop the music and leave the voice channel"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    queue.destroy();
    await interaction.reply({ embeds: [success(interaction, "Stopped the music and left the voice channel.")] });
  },
};
