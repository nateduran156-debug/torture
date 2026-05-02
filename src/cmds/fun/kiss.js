const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Kiss someone")
    .addUserOption(o => o.setName("user").setDescription("User to kiss").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const embed = base(interaction)
      .setDescription(`😘 **${interaction.user.username}** kissed **${user.username}**!`)
      .setImage("https://media.tenor.com/images/76c9a6bea8aec5ab9964e1db74fb8e72/tenor.gif");
    await interaction.reply({ embeds: [embed] });
  },
};
