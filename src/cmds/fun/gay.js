const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gay")
    .setDescription("Check someone's gay percentage")
    .addUserOption(o => o.setName("user").setDescription("User to check")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const pct = Math.floor(Math.random() * 101);
    const bar = "🏳️‍🌈".repeat(Math.floor(pct / 20)) + "⬜".repeat(5 - Math.floor(pct / 20));

    const embed = base(interaction)
      .setTitle(`${user.username}'s gay meter`)
      .setDescription(`${bar} **${pct}%**`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed] });
  },
};
