const { SlashCommandBuilder } = require("discord.js");
const { info } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder().setName("membercount").setDescription("Show the server's member count"),
  async execute(interaction) {
    const g = interaction.guild;
    await g.members.fetch();
    const total = g.memberCount;
    const humans = g.members.cache.filter(m => !m.user.bot).size;
    const bots = g.members.cache.filter(m => m.user.bot).size;
    await interaction.reply({ embeds: [info(interaction, `${g.name} — Member Count`, null, [
      { name: "Total", value: total.toLocaleString(), inline: true },
      { name: "Humans", value: humans.toLocaleString(), inline: true },
      { name: "Bots", value: bots.toLocaleString(), inline: true },
    ])] });
  },
};
