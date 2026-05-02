const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const { getLastfm } = require("../../utils/database");
const { lfmGet } = require("./lastfm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show what you or someone else is currently playing on Last.fm")
    .addUserOption(o => o.setName("user").setDescription("User to check")),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getUser("user") ?? interaction.user;
    const username = getLastfm(target.id);
    if (!username) return interaction.editReply({ embeds: [error(interaction, target.id === interaction.user.id ? "You haven't linked Last.fm. Use `/lastfm set`." : `**${target.username}** hasn't linked Last.fm.`)] });

    try {
      const data = await lfmGet({ method: "user.getrecenttracks", user: username, limit: 1 });
      const tracks = data.recenttracks?.track;
      const track = Array.isArray(tracks) ? tracks[0] : tracks;
      if (!track) return interaction.editReply({ embeds: [error(interaction, `**${username}** hasn't scrobbled anything yet.`)] });

      const isPlaying = track["@attr"]?.nowplaying === "true";
      const image = track.image?.find(i => i.size === "extralarge")?.["#text"] || track.image?.[2]?.["#text"];

      const embed = base(interaction)
        .setAuthor({ name: `${isPlaying ? "Now Playing" : "Last Played"} — ${username}`, iconURL: target.displayAvatarURL({ dynamic: true }) })
        .setTitle(`${track.name}`)
        .setURL(`https://www.last.fm/music/${encodeURIComponent(track.artist?.["#text"])}/_/${encodeURIComponent(track.name)}`)
        .setDescription(`by **${track.artist?.["#text"]}** on *${track.album?.["#text"] || "Unknown Album"}*`)
        .setThumbnail(image || null)
        .setFooter({ text: isPlaying ? "🎵 Currently playing" : `Last played: ${new Date(parseInt(track.date?.uts) * 1000).toLocaleString()}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error(interaction, e.message)] });
    }
  },
};
