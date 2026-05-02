const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const choices = ["rock", "paper", "scissors"];
const emojis = { rock: "🪨", paper: "📄", scissors: "✂️" };

function getResult(user, bot) {
  if (user === bot) return "draw";
  if ((user === "rock" && bot === "scissors") || (user === "paper" && bot === "rock") || (user === "scissors" && bot === "paper")) return "win";
  return "lose";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play rock, paper, scissors")
    .addStringOption(o => o.setName("choice").setDescription("Your choice").setRequired(true).addChoices(
      { name: "Rock 🪨", value: "rock" }, { name: "Paper 📄", value: "paper" }, { name: "Scissors ✂️", value: "scissors" }
    )),

  async execute(interaction) {
    const userChoice = interaction.options.getString("choice");
    const botChoice = choices[Math.floor(Math.random() * 3)];
    const result = getResult(userChoice, botChoice);

    const outcomes = { win: "🏆 You win!", lose: "❌ You lose!", draw: "🤝 It's a draw!" };

    const embed = base(interaction)
      .setTitle("Rock, Paper, Scissors")
      .addFields(
        { name: "You", value: `${emojis[userChoice]} ${userChoice}`, inline: true },
        { name: "Bot", value: `${emojis[botChoice]} ${botChoice}`, inline: true },
        { name: "Result", value: outcomes[result] },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
