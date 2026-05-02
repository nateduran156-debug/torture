const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");
const { AudioPlayerStatus } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause the music"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.current) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    if (queue.player.state.status === AudioPlayerStatus.Paused) return interaction.reply({ embeds: [error(interaction, "Already paused. Use `/resume`.")], ephemeral: true });
    queue.pause();
    await interaction.reply({ embeds: [success(interaction, "Paused the music.")] });
  },
};
