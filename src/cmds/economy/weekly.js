const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weekly")
    .setDescription("Collect your weekly reward"),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const now = Date.now();
    const cooldown = 7 * 24 * 60 * 60 * 1000;

    if (now - eco.lastWeekly < cooldown) {
      const remaining = eco.lastWeekly + cooldown - now;
      const days = Math.floor(remaining / 86400000);
      const hrs = Math.floor((remaining % 86400000) / 3600000);
      return interaction.reply({ embeds: [error(interaction, `You already claimed your weekly. Come back in **${days}d ${hrs}h**.`)], ephemeral: true });
    }

    eco.wallet += config.economy.weekly;
    eco.lastWeekly = now;
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `You claimed your weekly reward of **$${config.economy.weekly}**!\n💵 New wallet balance: **$${eco.wallet.toLocaleString()}**`)] });
  },
};
