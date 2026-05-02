const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const { SHOP_ITEMS } = require("./shop");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop")
    .addStringOption(o => o.setName("item").setDescription("Item ID to buy").setRequired(true)
      .addChoices(...SHOP_ITEMS.map(i => ({ name: i.name, value: i.id })))),

  async execute(interaction) {
    const itemId = interaction.options.getString("item");
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return interaction.reply({ embeds: [error(interaction, "Item not found.")], ephemeral: true });

    const eco = getEconomy(interaction.user.id);
    if (eco.wallet < item.price) return interaction.reply({ embeds: [error(interaction, `You need **$${item.price.toLocaleString()}** but only have **$${eco.wallet.toLocaleString()}**.`)], ephemeral: true });

    eco.wallet -= item.price;
    eco.inventory = eco.inventory ?? [];
    eco.inventory.push(item.id);
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `Purchased **${item.name}** for **$${item.price.toLocaleString()}**!\n💵 New balance: **$${eco.wallet.toLocaleString()}**`)] });
  },
};
