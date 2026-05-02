const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const { getLastfm } = require("../../utils/database");
const { lfmGet } = require("./lastfm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("taste")
    .setDescription("Compare your music taste with another user")
    .addUserOption(o => o.setName("user").setDescription("User to compare with").setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getUser("user");
    const user1 = getLastfm(interaction.user.id);
    const user2 = getLastfm(target.id);
    if (!user1) return interaction.editReply({ embeds: [error(interaction, "You haven't linked Last.fm. Use `/lastfm set`.")] });
    if (!user2) return interaction.editReply({ embeds: [error(interaction, `**${target.username}** hasn't linked Last.fm.`)] });

    try {
      const [d1, d2] = await Promise.all([
        lfmGet({ method: "user.gettopartists", user: user1, period: "overall", limit: 50 }),
        lfmGet({ method: "user.gettopartists", user: user2, period: "overall", limit: 50 }),
      ]);

      const a1 = new Set((d1.topartists?.artist ?? []).map(a => a.name.toLowerCase()));
      const a2 = (d2.topartists?.artist ?? []).map(a => a.name);
      const common = a2.filter(a => a1.has(a.toLowerCase()));

      const compat = Math.min(100, Math.round((common.length / Math.max(a1.size, a2.length)) * 300));
      const embed = base(interaction)
        .setTitle(`${user1} vs ${user2}`)
        .setDescription(`**Compatibility:** ${compat}%\n**Shared Artists:** ${common.length}`)
        .addFields({ name: "Common Artists", value: common.slice(0, 10).join(", ") || "None" });

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ embeds: [error(interaction, e.message)] });
    }
  },
};
