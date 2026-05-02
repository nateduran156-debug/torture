const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("urban")
    .setDescription("Look up a term on Urban Dictionary")
    .addStringOption(o => o.setName("term").setDescription("Term to search").setRequired(true)),

  async execute(interaction) {
    const term = interaction.options.getString("term");
    await interaction.deferReply();

    try {
      const { data } = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
      const entry = data?.list?.[0];

      if (!entry) {
        return interaction.editReply({ embeds: [error(interaction, `No results found for **${term}**.`)] });
      }

      const clean = (s) => s.replace(/\[(.+?)]/g, "$1").slice(0, 1024);
      const thumbsUp   = entry.thumbs_up ?? 0;
      const thumbsDown = entry.thumbs_down ?? 0;
      const written    = entry.author ?? "Unknown";
      const link       = entry.permalink ?? "https://urbandictionary.com";

      const embed = base(interaction)
        .setTitle(entry.word)
        .setURL(link)
        .setDescription(clean(entry.definition))
        .setColor(0x1d2439)
        .addFields(
          { name: "Example", value: clean(entry.example) || "None", inline: false },
          { name: "Rating", value: `👍 ${thumbsUp.toLocaleString()}  👎 ${thumbsDown.toLocaleString()}`, inline: true },
          { name: "Author", value: written, inline: true },
        )
        .setFooter({ text: "Urban Dictionary" });

      return interaction.editReply({ embeds: [embed] });
    } catch {
      return interaction.editReply({ embeds: [error(interaction, "Failed to reach Urban Dictionary.")] });
    }
  },
};
