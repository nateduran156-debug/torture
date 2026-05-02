const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

const COINS = [
  ["Bitcoin",   "bitcoin"],  ["Ethereum",   "ethereum"],  ["Solana",    "solana"],
  ["BNB",       "binancecoin"], ["Cardano",  "cardano"],   ["XRP",       "ripple"],
  ["Dogecoin",  "dogecoin"], ["Shiba Inu",  "shiba-inu"], ["Avalanche", "avalanche-2"],
  ["Litecoin",  "litecoin"], ["Chainlink",  "chainlink"], ["Polkadot",  "polkadot"],
  ["Polygon",   "matic-network"], ["TRON",  "tron"],      ["Pepe",      "pepe"],
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crypto")
    .setDescription("Get the current price of a cryptocurrency")
    .addStringOption(o =>
      o.setName("coin").setDescription("Coin to look up").setRequired(true)
        .addChoices(...COINS.map(([name, id]) => ({ name, value: id })))
    ),

  async execute(interaction) {
    const coinId = interaction.options.getString("coin");
    const name   = COINS.find(c => c[1] === coinId)?.[0] ?? coinId;
    await interaction.deferReply();

    try {
      const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        { params: { ids: coinId, vs_currencies: "usd", include_24hr_change: true, include_market_cap: true }, timeout: 8000 }
      );

      const info   = data[coinId];
      if (!info) return interaction.editReply({ embeds: [error(interaction, `No data found for **${name}**.`)] });

      const price  = info.usd?.toLocaleString("en-US", { style: "currency", currency: "USD" }) ?? "N/A";
      const change = info.usd_24h_change?.toFixed(2) ?? 0;
      const mcap   = info.usd_market_cap ? `$${(info.usd_market_cap / 1e9).toFixed(2)}B` : "N/A";
      const arrow  = change >= 0 ? "📈" : "📉";
      const color  = change >= 0 ? 0x57f287 : 0xed4245;

      return interaction.editReply({
        embeds: [
          base(interaction)
            .setTitle(`${arrow} ${name}`)
            .addFields(
              { name: "Price",      value: price,             inline: true },
              { name: "24h Change", value: `${change > 0 ? "+" : ""}${change}%`, inline: true },
              { name: "Market Cap", value: mcap,              inline: true },
            )
            .setColor(color)
            .setFooter({ text: "Powered by CoinGecko" }),
        ],
      });
    } catch {
      return interaction.editReply({ embeds: [error(interaction, "Failed to fetch crypto data.")] });
    }
  },
};
