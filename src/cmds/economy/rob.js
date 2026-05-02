const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Attempt to rob another user's wallet")
    .addUserOption(o => o.setName("user").setDescription("User to rob").setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [error(interaction, "You can't rob yourself.")], ephemeral: true });
    if (target.bot) return interaction.reply({ embeds: [error(interaction, "You can't rob a bot.")], ephemeral: true });

    const robberEco = getEconomy(interaction.user.id);
    const now = Date.now();
    const cooldown = 30 * 60 * 1000;

    if (now - robberEco.lastRob < cooldown) {
      const remaining = robberEco.lastRob + cooldown - now;
      const mins = Math.floor(remaining / 60000);
      return interaction.reply({ embeds: [error(interaction, `You're laying low. Try again in **${mins}m**.`)], ephemeral: true });
    }

    const victimEco = getEconomy(target.id);
    if (victimEco.wallet < 50) return interaction.reply({ embeds: [error(interaction, `**${target.username}** doesn't have enough money to rob.`)], ephemeral: true });

    robberEco.lastRob = now;
    const success_ = Math.random() * 100 < config.economy.robSuccessChance;

    if (success_) {
      const amount = Math.min(Math.floor(Math.random() * config.economy.robMax) + 1, victimEco.wallet);
      victimEco.wallet -= amount;
      robberEco.wallet += amount;
      saveEconomy(interaction.user.id, robberEco);
      saveEconomy(target.id, victimEco);
      await interaction.reply({ embeds: [success(interaction, `You successfully robbed **${target.username}** and got away with **$${amount.toLocaleString()}**! 🦹`)] });
    } else {
      const fine = Math.min(config.economy.robMax, robberEco.wallet);
      robberEco.wallet -= fine;
      saveEconomy(interaction.user.id, robberEco);
      await interaction.reply({ embeds: [error(interaction, `You got caught trying to rob **${target.username}** and were fined **$${fine.toLocaleString()}**! 👮`)] });
    }
  },
};
