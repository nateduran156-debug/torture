const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");
const { AudioPlayerStatus } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("Resume the music"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.current) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    if (queue.player.state.status !== AudioPlayerStatus.Paused) return interaction.reply({ embeds: [error(interaction, "Music is not paused.")], ephemeral: true });
    queue.resume();
    await interaction.reply({ embeds: [success(interaction, "Resumed the music.")] });
  },
};
