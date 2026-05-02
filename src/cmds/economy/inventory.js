const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");
const { getEconomy } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your or someone's inventory")
    .addUserOption(o => o.setName("user").setDescription("User to check")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const eco = getEconomy(user.id);

    if (!eco.inventory || !eco.inventory.length)
      return interaction.reply({ embeds: [info(interaction, null, `**${user.username}**'s inventory is empty.`)] });

    const counts = {};
    for (const item of eco.inventory) counts[item] = (counts[item] || 0) + 1;

    const embed = base(interaction)
      .setTitle(`${user.username}'s Inventory`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(Object.entries(counts).map(([item, count]) => `${item} x${count}`).join("\n"));

    await interaction.reply({ embeds: [embed] });
  },
};
