const { SlashCommandBuilder } = require("discord.js");
const { success, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");
const config = require("../../../config.json");

const jobs = ["programmer", "chef", "driver", "teacher", "doctor", "engineer", "artist", "musician", "plumber", "pilot"];
const tasks = ["fixed a bug", "cooked dinner", "delivered packages", "taught a class", "diagnosed a patient", "built a bridge", "painted a mural", "performed a concert", "fixed a pipe", "flew a plane"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn some money"),

  async execute(interaction) {
    const eco = getEconomy(interaction.user.id);
    const now = Date.now();
    const cooldown = 60 * 60 * 1000;

    if (now - eco.lastWork < cooldown) {
      const remaining = eco.lastWork + cooldown - now;
      const mins = Math.floor(remaining / 60000);
      return interaction.reply({ embeds: [error(interaction, `You're tired. Come back in **${mins}m**.`)], ephemeral: true });
    }

    const earned = Math.floor(Math.random() * (config.economy.workMax - config.economy.workMin + 1)) + config.economy.workMin;
    const idx = Math.floor(Math.random() * jobs.length);
    eco.wallet += earned;
    eco.lastWork = now;
    saveEconomy(interaction.user.id, eco);

    await interaction.reply({ embeds: [success(interaction, `You worked as a **${jobs[idx]}** and ${tasks[idx]}.\nYou earned **$${earned}**! 💵`)] });
  },
};
