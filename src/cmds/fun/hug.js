const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug someone")
    .addUserOption(o => o.setName("user").setDescription("User to hug").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const embed = base(interaction)
      .setDescription(`🤗 **${interaction.user.username}** hugged **${user.username}**!`)
      .setImage("https://media.tenor.com/images/c0e3b72cde5f5b0a2818fd99b5a4c344/tenor.gif");
    await interaction.reply({ embeds: [embed] });
  },
};
