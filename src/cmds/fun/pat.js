const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Pat someone on the head")
    .addUserOption(o => o.setName("user").setDescription("User to pat").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const embed = base(interaction)
      .setDescription(`🥺 **${interaction.user.username}** patted **${user.username}**!`)
      .setImage("https://media.tenor.com/images/fb2d05b61f6b8ac4b57ef0f8c1cb18f4/tenor.gif");
    await interaction.reply({ embeds: [embed] });
  },
};
