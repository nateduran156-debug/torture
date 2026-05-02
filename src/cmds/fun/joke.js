const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Get a random joke"),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const { data } = await axios.get("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist&type=twopart");
      const embed = base(interaction)
        .setTitle("😄 Joke")
        .addFields(
          { name: "Setup", value: data.setup },
          { name: "Punchline", value: data.delivery },
        );
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [base(interaction).setDescription("Why did the bot fail? Because it got a bad response from the API 😅")] });
    }
  },
};
