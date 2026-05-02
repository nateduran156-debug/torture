const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show the currently playing track"),
  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue?.current) return interaction.reply({ embeds: [error(interaction, "Nothing is playing.")], ephemeral: true });
    const t = queue.current;
    const embed = base(interaction)
      .setTitle("🎵 Now Playing")
      .setDescription(`[${t.title}](${t.url})`)
      .setThumbnail(t.thumbnail ?? null)
      .addFields(
        { name: "Duration", value: t.duration, inline: true },
        { name: "Requested by", value: `<@${t.requesterId}>`, inline: true },
        { name: "Loop", value: queue.loop, inline: true },
        { name: "Volume", value: `${queue.volume}%`, inline: true },
        { name: "Queue", value: `${queue.tracks.length} track(s)`, inline: true },
      );
    await interaction.reply({ embeds: [embed] });
  },
};
