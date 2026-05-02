const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("color")
    .setDescription("Preview a color by its hex code")
    .addStringOption(o => o.setName("hex").setDescription("Hex color code (e.g. #ff5733)").setRequired(true)),

  async execute(interaction) {
    let hex = interaction.options.getString("hex").trim();
    if (!hex.startsWith("#")) hex = "#" + hex;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return interaction.reply({ embeds: [error(interaction, "Invalid hex color. Example: `#ff5733`")], ephemeral: true });

    const { r, g, b } = hexToRgb(hex);
    const colorInt = parseInt(hex.slice(1), 16);

    const embed = base(interaction)
      .setTitle(hex.toUpperCase())
      .setColor(colorInt)
      .setThumbnail(`https://singlecolorimage.com/get/${hex.slice(1)}/100x100`)
      .addFields(
        { name: "HEX", value: hex.toUpperCase(), inline: true },
        { name: "RGB", value: `${r}, ${g}, ${b}`, inline: true },
        { name: "INT", value: `${colorInt}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
