const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin")
    .addStringOption(o => o.setName("guess").setDescription("Your guess: heads or tails").addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const guess = interaction.options.getString("guess");
    const emoji = result === "heads" ? "🪙" : "🪙";

    let desc = `${emoji} The coin landed on **${result}**!`;
    if (guess) desc += guess === result ? "\n✅ You guessed correctly!" : "\n❌ Wrong guess!";

    const embed = base(interaction).setTitle("Coin Flip").setDescription(desc);
    await interaction.reply({ embeds: [embed] });
  },
};
