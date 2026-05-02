const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll dice (e.g. 2d6, 1d20)")
    .addStringOption(o => o.setName("dice").setDescription("Dice notation (e.g. 2d6, 1d20, 3d8)").setRequired(true)),

  async execute(interaction) {
    const input = interaction.options.getString("dice").toLowerCase().trim();
    const match = input.match(/^(\d+)d(\d+)$/);
    if (!match) return interaction.reply({ embeds: [error(interaction, "Invalid dice format. Use something like `2d6` or `1d20`.")], ephemeral: true });

    const count = Math.min(parseInt(match[1]), 20);
    const sides = Math.min(parseInt(match[2]), 1000);
    if (count < 1 || sides < 2) return interaction.reply({ embeds: [error(interaction, "Invalid dice. Minimum 1 die with 2 sides.")], ephemeral: true });

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);

    const embed = base(interaction)
      .setTitle(`🎲 ${count}d${sides}`)
      .addFields(
        { name: "Rolls", value: rolls.join(", "), inline: true },
        { name: "Total", value: `${total}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
