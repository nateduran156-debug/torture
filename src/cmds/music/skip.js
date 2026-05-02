const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current track"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.current) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    const skipped = queue.current.title;
    queue.skip();
    await interaction.reply({ embeds: [success(interaction, `Skipped **${skipped}**.`)] });
  },
};
