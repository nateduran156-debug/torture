const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pp")
    .setDescription("Measure someone's pp size")
    .addUserOption(o => o.setName("user").setDescription("User to measure")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const size = Math.floor(Math.random() * 15);
    const pp = "8" + "=".repeat(size) + "D";

    const embed = base(interaction)
      .setTitle(`${user.username}'s pp`)
      .setDescription(`\`${pp}\`\n**Size:** ${size} inches`);

    await interaction.reply({ embeds: [embed] });
  },
};
