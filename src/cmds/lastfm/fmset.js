const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { setLastfm, removeLastfm, getLastfm } = require("../../utils/database");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fmset")
    .setDescription("Quickly set or unlink your Last.fm username")
    .addStringOption(o => o.setName("username").setDescription("Your Last.fm username, or 'none' to unlink").setRequired(true)),

  async execute(interaction) {
    const username = interaction.options.getString("username");

    if (username.toLowerCase() === "none") {
      removeLastfm(interaction.user.id);
      return interaction.reply({ embeds: [success(interaction, "Unlinked your Last.fm account.")] });
    }

    await interaction.deferReply();
    const key = process.env.LASTFM_API_KEY;
    if (!key) return interaction.editReply({ embeds: [error(interaction, "LASTFM_API_KEY is not configured.")] });

    try {
      const { data } = await axios.get("http://ws.audioscrobbler.com/2.0/", { params: { method: "user.getinfo", user: username, api_key: key, format: "json" } });
      if (data.error) return interaction.editReply({ embeds: [error(interaction, `User **${username}** not found on Last.fm.`)] });
      setLastfm(interaction.user.id, username);
      await interaction.editReply({ embeds: [success(interaction, `Linked your Last.fm to **[${data.user.name}](${data.user.url})**.`)] });
    } catch {
      await interaction.editReply({ embeds: [error(interaction, `Could not verify **${username}** on Last.fm.`)] });
    }
  },
};
