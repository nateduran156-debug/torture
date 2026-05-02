const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Ship two users together")
    .addUserOption(o => o.setName("user1").setDescription("First user").setRequired(true))
    .addUserOption(o => o.setName("user2").setDescription("Second user").setRequired(true)),

  async execute(interaction) {
    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");
    const score = Math.floor(Math.random() * 101);
    const bar = "█".repeat(Math.floor(score / 10)) + "░".repeat(10 - Math.floor(score / 10));

    let verdict;
    if (score < 20) verdict = "💔 Terrible match...";
    else if (score < 40) verdict = "😬 Not great...";
    else if (score < 60) verdict = "🤔 Could work!";
    else if (score < 80) verdict = "💕 Pretty good!";
    else verdict = "❤️ Perfect match!";

    const shipName = user1.username.slice(0, Math.ceil(user1.username.length / 2)) + user2.username.slice(Math.floor(user2.username.length / 2));

    const embed = base(interaction)
      .setTitle(`💘 ${user1.username} & ${user2.username}`)
      .setDescription(`**Ship name:** ${shipName}\n\n\`${bar}\` **${score}%**\n${verdict}`)
      .setThumbnail(user1.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed] });
  },
};
