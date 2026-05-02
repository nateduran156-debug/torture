const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a random meme"),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const { data } = await axios.get("https://meme-api.com/gimme");
      const embed = base(interaction)
        .setTitle(data.title)
        .setImage(data.url)
        .setURL(data.postLink)
        .setFooter({ text: `👍 ${data.ups} • r/${data.subreddit}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [error(interaction, "Failed to fetch a meme. Try again later.")] });
    }
  },
};
