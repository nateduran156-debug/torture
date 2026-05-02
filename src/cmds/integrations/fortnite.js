const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fortnite")
    .setDescription("Fortnite commands")
    .addSubcommand(s => s.setName("shop").setDescription("View today's Fortnite item shop (first few items)"))
    .addSubcommand(s => s.setName("cosmetic").setDescription("Search for a Fortnite cosmetic").addStringOption(o => o.setName("name").setDescription("Cosmetic name").setRequired(true)))
    .addSubcommand(s => s.setName("stats").setDescription("View Fortnite player stats").addStringOption(o => o.setName("username").setDescription("Epic Games username").setRequired(true)).addStringOption(o => o.setName("platform").setDescription("Platform").addChoices({ name: "PC", value: "kbm" }, { name: "Controller", value: "gamepad" }, { name: "Touch", value: "touch" }))),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === "shop") {
      try {
        const { data } = await axios.get("https://fortnite-api.com/v2/shop/br/combined", { headers: { Authorization: process.env.FORTNITE_API_KEY ?? "" } });
        const entries = (data.data?.featured?.entries ?? []).concat(data.data?.daily?.entries ?? []).slice(0, 10);
        const embed = base(interaction).setTitle("🛒 Fortnite Item Shop").setURL("https://fortnite.com");
        for (const entry of entries) {
          const item = entry.items?.[0];
          if (!item) continue;
          embed.addFields({ name: item.name, value: `${entry.finalPrice} V-Bucks | ${item.type?.displayValue ?? ""}`, inline: true });
        }
        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply({ embeds: [error(interaction, "Failed to fetch the item shop.")] });
      }
    } else if (sub === "cosmetic") {
      const name = interaction.options.getString("name");
      try {
        const { data } = await axios.get(`https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(name)}&matchMethod=contains`);
        const c = data.data;
        const embed = base(interaction)
          .setTitle(c.name)
          .setDescription(`**Type:** ${c.type?.displayValue ?? "Unknown"}\n**Rarity:** ${c.rarity?.displayValue ?? "Unknown"}\n${c.description ?? ""}`)
          .setThumbnail(c.images?.icon ?? c.images?.smallIcon ?? null)
          .setImage(c.images?.featured ?? null);
        if (c.set?.value) embed.addFields({ name: "Set", value: c.set.text, inline: true });
        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply({ embeds: [error(interaction, `No cosmetic found matching \`${name}\`.`)] });
      }
    } else if (sub === "stats") {
      const username = interaction.options.getString("username");
      const platform = interaction.options.getString("platform") ?? "kbm";
      try {
        const { data } = await axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(username)}&image=${platform}`);
        const s = data.data;
        const overall = s.stats?.all?.overall;
        const embed = base(interaction)
          .setTitle(`${s.account?.name}'s Fortnite Stats`)
          .setImage(data.data?.image ?? null)
          .addFields(
            { name: "Wins", value: `${overall?.wins?.toLocaleString() ?? 0}`, inline: true },
            { name: "Matches", value: `${overall?.matches?.toLocaleString() ?? 0}`, inline: true },
            { name: "Kills", value: `${overall?.kills?.toLocaleString() ?? 0}`, inline: true },
            { name: "Win Rate", value: `${overall?.winRate ?? 0}%`, inline: true },
            { name: "K/D", value: `${overall?.kd ?? 0}`, inline: true },
          );
        await interaction.editReply({ embeds: [embed] });
      } catch {
        await interaction.editReply({ embeds: [error(interaction, `Could not find stats for \`${username}\`. Make sure their stats are public.`)] });
      }
    }
  },
};
