const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user money from your wallet")
    .addUserOption(o => o.setName("user").setDescription("User to pay").setRequired(true))
    .addIntegerOption(o => o.setName("amount").setDescription("Amount to pay").setRequired(true).setMinValue(1)),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (target.id === interaction.user.id) return interaction.reply({ embeds: [error(interaction, "You can't pay yourself.")], ephemeral: true });
    if (target.bot) return interaction.reply({ embeds: [error(interaction, "You can't pay a bot.")], ephemeral: true });

    const senderEco = getEconomy(interaction.user.id);
    if (senderEco.wallet < amount) return interaction.reply({ embeds: [error(interaction, `You only have **$${senderEco.wallet.toLocaleString()}** in your wallet.`)], ephemeral: true });

    const receiverEco = getEconomy(target.id);
    senderEco.wallet -= amount;
    receiverEco.wallet += amount;
    saveEconomy(interaction.user.id, senderEco);
    saveEconomy(target.id, receiverEco);

    await interaction.reply({ embeds: [success(interaction, `Paid **$${amount.toLocaleString()}** to **${target.tag}**.`)] });
  },
};
