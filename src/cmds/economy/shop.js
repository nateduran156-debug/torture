const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const SHOP_ITEMS = [
  { id: "fishing_rod", name: "🎣 Fishing Rod", price: 500, description: "Required to go fishing" },
  { id: "hunting_rifle", name: "🔫 Hunting Rifle", price: 800, description: "Required to go hunting" },
  { id: "pickaxe", name: "⛏️ Pickaxe", price: 600, description: "Required to go mining" },
  { id: "laptop", name: "💻 Laptop", price: 1200, description: "Boosts work earnings by 20%" },
  { id: "lucky_coin", name: "🍀 Lucky Coin", price: 2000, description: "Increases rob success chance" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse the shop"),

  async execute(interaction) {
    const embed = base(interaction)
      .setTitle("🛒 Shop")
      .setDescription("Use `/buy <item>` to purchase an item.");

    for (const item of SHOP_ITEMS) {
      embed.addFields({ name: item.name, value: `${item.description}\n**Price:** $${item.price.toLocaleString()}`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports.SHOP_ITEMS = SHOP_ITEMS;
