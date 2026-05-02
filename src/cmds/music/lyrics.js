const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Get lyrics for a song")
    .addStringOption(o => o.setName("query").setDescription("Song title (leave empty to use current song)")),

  async execute(interaction) {
    await interaction.deferReply();
    let query = interaction.options.getString("query");
    if (!query) {
      const queue = MusicManager.get(interaction.guild.id);
      query = queue?.current?.title;
    }
    if (!query) return interaction.editReply({ embeds: [error(interaction, "Provide a song or have music playing.")] });

    const clean = query.replace(/\(.*?\)|\[.*?\]|official|video|audio|lyric|hd|4k/gi, "").trim();
    const parts = clean.split(/[-–|]/);
    const artist = parts[0]?.trim() ?? clean;
    const title = parts[1]?.trim() ?? clean;

    try {
      const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      const lyrics = data.lyrics?.slice(0, 3900) ?? "No lyrics found.";
      const embed = base(interaction).setTitle(`🎵 ${clean}`).setDescription(lyrics);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [error(interaction, `Could not find lyrics for **${query}**.`)] });
    }
  },
};
