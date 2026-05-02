const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Slap someone")
    .addUserOption(o => o.setName("user").setDescription("User to slap").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const embed = base(interaction)
      .setDescription(`👋 **${interaction.user.username}** slapped **${user.username}**!`)
      .setImage("https://media.tenor.com/images/d0d13d2fda02d29be3e0ecc2d44bfdb5/tenor.gif");
    await interaction.reply({ embeds: [embed] });
  },
};
