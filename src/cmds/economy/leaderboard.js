const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");
const fs = require("fs");
const path = require("path");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the richest users"),

  async execute(interaction) {
    await interaction.deferReply();
    const file = path.resolve(__dirname, "../../../", config.dataPath, "economy.json");
    if (!fs.existsSync(file)) return interaction.editReply({ embeds: [info(interaction, null, "No economy data yet.")] });

    const db = JSON.parse(fs.readFileSync(file, "utf-8"));
    const sorted = Object.entries(db)
      .map(([id, data]) => ({ id, total: (data.wallet || 0) + (data.bank || 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (!sorted.length) return interaction.editReply({ embeds: [info(interaction, null, "No economy data yet.")] });

    const medals = ["🥇", "🥈", "🥉"];
    const lines = await Promise.all(sorted.map(async ({ id, total }, i) => {
      let name;
      try { name = (await interaction.client.users.fetch(id)).username; } catch { name = `User ${id}`; }
      return `${medals[i] || `**${i + 1}.**`} **${name}** — $${total.toLocaleString()}`;
    }));

    const embed = base(interaction).setTitle("💰 Economy Leaderboard").setDescription(lines.join("\n"));
    await interaction.editReply({ embeds: [embed] });
  },
};
