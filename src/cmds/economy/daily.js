const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Collect your daily reward"),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (now - eco.lastDaily < cooldown) {
      const remaining = eco.lastDaily + cooldown - now;
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      return interaction.reply({ embeds: [error(interaction, `You already claimed your daily. Come back in **${hrs}h ${mins}m**.`)], ephemeral: true });
    }

    eco.wallet += config.economy.daily;
    eco.lastDaily = now;
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `You claimed your daily reward of **$${config.economy.daily}**!\n💵 New wallet balance: **$${eco.wallet.toLocaleString()}**`)] });
  },
};
