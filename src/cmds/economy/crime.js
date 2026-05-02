const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const config = require("../../../config.json");

const crimes = ["pickpocketed a tourist", "hacked an ATM", "forged a painting", "scammed a scammer", "stole a car", "ran a pyramid scheme"];
const failures = ["got caught by police", "tripped over your own feet", "dropped all the money", "got reported to the FBI", "were seen on CCTV"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription("Commit a crime for big rewards (or suffer the consequences)"),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const now = Date.now();
    const cooldown = 2 * 60 * 60 * 1000;

    if (now - eco.lastCrime < cooldown) {
      const remaining = eco.lastCrime + cooldown - now;
      const mins = Math.floor(remaining / 60000);
      return interaction.reply({ embeds: [error(interaction, `You're keeping a low profile. Try again in **${mins}m**.`)], ephemeral: true });
    }

    eco.lastCrime = now;
    const success_ = Math.random() < 0.5;

    if (success_) {
      const earned = Math.floor(Math.random() * (config.economy.crimeMax - config.economy.crimeMin + 1)) + config.economy.crimeMin;
      const crime = crimes[Math.floor(Math.random() * crimes.length)];
      eco.wallet += earned;
      saveEconomy(interaction.user.id, eco);
      await interaction.reply({ embeds: [success(interaction, `You ${crime} and earned **$${earned.toLocaleString()}**! 🕵️`)] });
    } else {
      const fine = Math.min(config.economy.crimeFine, eco.wallet);
      const failure = failures[Math.floor(Math.random() * failures.length)];
      eco.wallet -= fine;
      saveEconomy(interaction.user.id, eco);
      await interaction.reply({ embeds: [error(interaction, `You ${failure} and were fined **$${fine.toLocaleString()}**! 🚔`)] });
    }
  },
};
