const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const config = require("../../../config.json");

const donors = ["a passing stranger", "a wealthy merchant", "a kind old lady", "a random Discord mod", "a generous server owner", "your future self"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("beg")
    .setDescription("Beg for some spare change"),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const now = Date.now();
    const cooldown = 30 * 1000;

    if (now - eco.lastBeg < cooldown) {
      const remaining = Math.ceil((eco.lastBeg + cooldown - now) / 1000);
      return interaction.reply({ embeds: [error(interaction, `You just begged. Wait **${remaining}s** before begging again.`)], ephemeral: true });
    }

    const amount = Math.floor(Math.random() * (config.economy.begMax - config.economy.begMin + 1)) + config.economy.begMin;
    const donor = donors[Math.floor(Math.random() * donors.length)];
    eco.wallet += amount;
    eco.lastBeg = now;
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `${donor} gave you **$${amount}**! 🙏`)] });
  },
};
