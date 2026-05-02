const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const compliments = [
  "You have a truly unique way of looking at things.",
  "You light up every room you walk into.",
  "You make the world a better place just by being in it.",
  "You're more fun than bubble wrap.",
  "Your kindness is a genuine superpower.",
  "You have the best taste in friends.",
  "You're incredibly thoughtful and it really shows.",
  "You inspire people without even knowing it.",
  "Your creativity is genuinely impressive.",
  "You're exactly the kind of person the world needs more of.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Compliment a user")
    .addUserOption(o => o.setName("user").setDescription("User to compliment").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    const embed = base(interaction)
      .setTitle(`💌 For ${user.username}`)
      .setDescription(compliment)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed] });
  },
};
