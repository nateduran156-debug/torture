const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const { getLastfm } = require("../../utils/database");
const { lfmGet } = require("./lastfm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("recenttracks")
    .setDescription("View recently played tracks on Last.fm")
    .addUserOption(o => o.setName("user").setDescription("User to check")),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getUser("user") ?? interaction.user;
    const username = getLastfm(target.id);
    if (!username) return interaction.editReply({ embeds: [error(interaction, `No Last.fm account linked.`)] });

    try {
      const data = await lfmGet({ method: "user.getrecenttracks", user: username, limit: 10 });
      const tracks = data.recenttracks?.track ?? [];
      const list = (Array.isArray(tracks) ? tracks : [tracks]).slice(0, 10);

      const embed = base(interaction)
        .setTitle(`${username}'s Recent Tracks`)
        .setURL(`https://www.last.fm/user/${username}`)
        .setDescription(list.map((t, i) => `**${i + 1}.** [${t.name}](https://www.last.fm/music/${encodeURIComponent(t.artist?.["#text"])}/_/${encodeURIComponent(t.name)}) by **${t.artist?.["#text"]}**${t["@attr"]?.nowplaying ? " 🎵" : ""}`).join("\n"))
        .setThumbnail(list[0]?.image?.[2]?.["#text"] || null);

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error(interaction, e.message)] });
    }
  },
};
