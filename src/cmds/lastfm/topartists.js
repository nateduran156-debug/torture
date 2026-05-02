const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const { getLastfm } = require("../../utils/database");
const { lfmGet } = require("./lastfm");

const PERIODS = [
  { name: "Overall", value: "overall" }, { name: "7 Days", value: "7day" },
  { name: "1 Month", value: "1month" }, { name: "3 Months", value: "3month" },
  { name: "6 Months", value: "6month" }, { name: "1 Year", value: "12month" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topartists")
    .setDescription("View top artists on Last.fm")
    .addUserOption(o => o.setName("user").setDescription("User to check"))
    .addStringOption(o => o.setName("period").setDescription("Time period").addChoices(...PERIODS)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getUser("user") ?? interaction.user;
    const username = getLastfm(target.id);
    if (!username) return interaction.editReply({ embeds: [error(interaction, "No Last.fm account linked.")] });
    const period = interaction.options.getString("period") ?? "overall";

    try {
      const data = await lfmGet({ method: "user.gettopartists", user: username, period, limit: 10 });
      const artists = data.topartists?.artist ?? [];
      const embed = base(interaction)
        .setTitle(`${username}'s Top Artists`)
        .setURL(`https://www.last.fm/user/${username}/library/artists`)
        .setDescription(artists.slice(0, 10).map((a, i) => `**${i + 1}.** [${a.name}](${a.url}) — ${parseInt(a.playcount).toLocaleString()} plays`).join("\n"));
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error(interaction, e.message)] });
    }
  },
};
