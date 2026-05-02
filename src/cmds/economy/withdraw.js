const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw money from your bank")
    .addStringOption(o => o.setName("amount").setDescription("Amount to withdraw (or 'all')").setRequired(true)),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const input = interaction.options.getString("amount").toLowerCase();
    const amount = input === "all" ? eco.bank : parseInt(input);

    if (isNaN(amount) || amount <= 0) return interaction.reply({ embeds: [error(interaction, "Please provide a valid amount.")], ephemeral: true });
    if (amount > eco.bank) return interaction.reply({ embeds: [error(interaction, `You only have **$${eco.bank.toLocaleString()}** in your bank.`)], ephemeral: true });

    eco.bank -= amount;
    eco.wallet += amount;
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `Withdrew **$${amount.toLocaleString()}** from your bank.\n💵 Wallet: **$${eco.wallet.toLocaleString()}**`)] });
  },
};
