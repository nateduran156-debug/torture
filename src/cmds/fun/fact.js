const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fact")
    .setDescription("Get a random interesting fact"),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const { data } = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
      const embed = base(interaction).setTitle("💡 Random Fact").setDescription(data.text);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [error(interaction, "Failed to fetch a fact. Try again later.")] });
    }
  },
};
