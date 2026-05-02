const { SlashCommandBuilder } = require("discord.js");
const { success, error, info } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set or view the music volume")
    .addIntegerOption(o => o.setName("level").setDescription("Volume 1-200").setMinValue(1).setMaxValue(200)),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.current) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    const level = interaction.options.getInteger("level");
    if (!level) return interaction.reply({ embeds: [info(interaction, null, `Current volume: **${queue.volume}%**`)] });
    queue.setVolume(level);
    await interaction.reply({ embeds: [success(interaction, `Set volume to **${level}%**.`)] });
  },
};
