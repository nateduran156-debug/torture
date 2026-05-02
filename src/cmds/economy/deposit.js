const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money into your bank")
    .addStringOption(o => o.setName("amount").setDescription("Amount to deposit (or 'all')").setRequired(true)),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const input = interaction.options.getString("amount").toLowerCase();
    const amount = input === "all" ? eco.wallet : parseInt(input);

    if (isNaN(amount) || amount <= 0) return interaction.reply({ embeds: [error(interaction, "Please provide a valid amount.")], ephemeral: true });
    if (amount > eco.wallet) return interaction.reply({ embeds: [error(interaction, `You only have **$${eco.wallet.toLocaleString()}** in your wallet.`)], ephemeral: true });

    eco.wallet -= amount;
    eco.bank += amount;
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `Deposited **$${amount.toLocaleString()}** into your bank.\n🏦 Bank: **$${eco.bank.toLocaleString()}**`)] });
  },
};
