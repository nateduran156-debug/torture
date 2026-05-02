const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

const LANGS = [
  ["English",    "en"], ["Spanish",    "es"], ["French",     "fr"],
  ["German",     "de"], ["Italian",    "it"], ["Portuguese", "pt"],
  ["Russian",    "ru"], ["Japanese",   "ja"], ["Chinese",    "zh"],
  ["Korean",     "ko"], ["Arabic",     "ar"], ["Hindi",      "hi"],
  ["Dutch",      "nl"], ["Turkish",    "tr"], ["Polish",     "pl"],
  ["Swedish",    "sv"], ["Greek",      "el"], ["Indonesian", "id"],
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate text to another language")
    .addStringOption(o => o.setName("text").setDescription("Text to translate").setRequired(true))
    .addStringOption(o =>
      o.setName("to").setDescription("Target language").setRequired(true)
        .addChoices(...LANGS.map(([name, code]) => ({ name, value: code })))
    )
    .addStringOption(o =>
      o.setName("from").setDescription("Source language (default: auto-detect)").setRequired(false)
        .addChoices(...LANGS.map(([name, code]) => ({ name, value: code })))
    ),

  async execute(interaction) {
    const text = interaction.options.getString("text");
    const to   = interaction.options.getString("to");
    const from = interaction.options.getString("from") ?? "autodetect";

    await interaction.deferReply();

    try {
      const { data } = await axios.get("https://api.mymemory.translated.net/get", {
        params: { q: text, langpair: `${from}|${to}` },
        timeout: 8000,
      });

      const translated = data?.responseData?.translatedText;
      if (!translated || data?.responseStatus !== 200) {
        return interaction.editReply({ embeds: [error(interaction, "Translation failed. Try a different language pair.")] });
      }

      const fromLabel = LANGS.find(l => l[1] === from)?.[0] ?? "Auto";
      const toLabel   = LANGS.find(l => l[1] === to)?.[0] ?? to;

      return interaction.editReply({
        embeds: [
          base(interaction)
            .setTitle("🌐 Translation")
            .addFields(
              { name: `${fromLabel}`, value: text.slice(0, 1024),       inline: false },
              { name: `${toLabel}`,   value: translated.slice(0, 1024), inline: false },
            )
            .setColor(0x2b2d31)
            .setFooter({ text: "Powered by MyMemory" }),
        ],
      });
    } catch {
      return interaction.editReply({ embeds: [error(interaction, "Failed to reach the translation API.")] });
    }
  },
};
