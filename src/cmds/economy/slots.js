const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const { getEconomy, saveEconomy } = require("../../utils/database");

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣"];
const MULTIPLIERS = { "7️⃣": 10, "💎": 7, "⭐": 5, "🍇": 4, "🍊": 3, "🍋": 2, "🍒": 1.5 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Play the slot machine")
    .addIntegerOption(o => o.setName("bet").setDescription("Amount to bet").setRequired(true).setMinValue(10)),

  async execute(interaction) {
    const bet = interaction.options.getInteger("bet");
    const eco = getEconomy(interaction.user.id);

    if (eco.wallet < bet) return interaction.reply({ embeds: [error(interaction, `You only have **$${eco.wallet.toLocaleString()}** in your wallet.`)], ephemeral: true });

    const spin = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const reels = [spin(), spin(), spin()];

    let result, payout;
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      const mult = MULTIPLIERS[reels[0]] ?? 2;
      payout = Math.floor(bet * mult);
      result = `🎉 **JACKPOT!** Three ${reels[0]}! You won **$${payout.toLocaleString()}**!`;
      eco.wallet += payout - bet;
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      payout = Math.floor(bet * 1.5);
      result = `✅ Two of a kind! You won **$${payout.toLocaleString()}**!`;
      eco.wallet += payout - bet;
    } else {
      result = `❌ No match. You lost **$${bet.toLocaleString()}**.`;
      eco.wallet -= bet;
    }

    saveEconomy(interaction.user.id, eco);

    const embed = base(interaction)
      .setTitle("🎰 Slot Machine")
      .setDescription(`\`[ ${reels.join(" | ")} ]\`\n\n${result}\n💵 Balance: **$${eco.wallet.toLocaleString()}**`);

    await interaction.reply({ embeds: [embed] });
  },
};
