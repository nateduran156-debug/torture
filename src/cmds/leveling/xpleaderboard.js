const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");
const { getLevelLeaderboard } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xpleaderboard")
    .setDescription("View the XP leaderboard for this server"),

  async execute(interaction) {
    await interaction.deferReply();
    const top = getLevelLeaderboard(interaction.guild.id);
    if (!top.length) return interaction.editReply({ embeds: [info(interaction, null, "No leveling data yet.")] });

    const medals = ["🥇", "🥈", "🥉"];
    const lines = await Promise.all(top.map(async ({ id, level, xp }, i) => {
      let name;
      try { name = (await interaction.client.users.fetch(id)).username; } catch { name = `User ${id}`; }
      return `${medals[i] || `**${i + 1}.**`} **${name}** — Level ${level} (${xp.toLocaleString()} XP)`;
    }));

    const embed = base(interaction).setTitle("⭐ XP Leaderboard").setDescription(lines.join("\n"));
    await interaction.editReply({ embeds: [embed] });
  },
};
