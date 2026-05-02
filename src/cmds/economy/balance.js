const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");
const { getEconomy } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your or someone's balance")
    .addUserOption(o => o.setName("user").setDescription("User to check")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const eco = getEconomy(user.id);

    const embed = base(interaction)
      .setTitle(`${user.username}'s Balance`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "💵 Wallet", value: `$${eco.wallet.toLocaleString()}`, inline: true },
        { name: "🏦 Bank", value: `$${eco.bank.toLocaleString()}`, inline: true },
        { name: "💰 Net Worth", value: `$${(eco.wallet + eco.bank).toLocaleString()}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
