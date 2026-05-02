const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Rate something out of 10")
    .addStringOption(o => o.setName("thing").setDescription("What to rate").setRequired(true)),

  async execute(interaction) {
    const thing = interaction.options.getString("thing");
    const score = (Math.abs(thing.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 11);

    const embed = base(interaction)
      .setTitle("⭐ Rating")
      .setDescription(`I'd rate **${thing}** a **${score}/10**`);

    await interaction.reply({ embeds: [embed] });
  },
};
