const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set loop mode")
    .addStringOption(o => o.setName("mode").setDescription("Loop mode").setRequired(true).addChoices(
      { name: "None", value: "none" }, { name: "Track", value: "track" }, { name: "Queue", value: "queue" }
    )),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.current) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    const mode = interaction.options.getString("mode");
    queue.loop = mode;
    await interaction.reply({ embeds: [success(interaction, `Loop mode set to **${mode}**.`)] });
  },
};
