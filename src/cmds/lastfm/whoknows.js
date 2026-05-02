const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const { getLastfm, getAllLastfm } = require("../../utils/database");
const { lfmGet } = require("./lastfm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whoknows")
    .setDescription("See who in this server listens to an artist most")
    .addStringOption(o => o.setName("artist").setDescription("Artist name").setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const artist = interaction.options.getString("artist");
    const allAccounts = getAllLastfm();
    const members = await interaction.guild.members.fetch();
    const linked = Object.entries(allAccounts).filter(([uid]) => members.has(uid));

    if (!linked.length) return interaction.editReply({ embeds: [error(interaction, "No one in this server has linked their Last.fm account.")] });

    const results = (await Promise.all(
      linked.map(async ([uid, username]) => {
        try {
          const data = await lfmGet({ method: "artist.getinfo", artist, username });
          const plays = parseInt(data.artist?.stats?.userplaycount ?? 0);
          return plays > 0 ? { uid, username, plays } : null;
        } catch { return null; }
      })
    )).filter(Boolean).sort((a, b) => b.plays - a.plays);

    if (!results.length) return interaction.editReply({ embeds: [error(interaction, `Nobody in this server has listened to **${artist}**.`)] });

    const medals = ["🥇", "🥈", "🥉"];
    const embed = base(interaction)
      .setTitle(`Who knows ${artist}?`)
      .setDescription(results.slice(0, 10).map((r, i) => `${medals[i] || `**${i + 1}.**`} <@${r.uid}> — **${r.plays.toLocaleString()}** plays`).join("\n"))
      .setFooter({ text: `${results.length} listener(s) in this server` });

    await interaction.editReply({ embeds: [embed] });
  },
};
