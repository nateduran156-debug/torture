const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");

const SAFE_RE = /^[0-9+\-*/().%^ \t]+$/;

function safeMath(expr) {
  const clean = expr.trim().replace(/\^/g, "**");
  if (!SAFE_RE.test(clean)) return null;
  try {
    const result = Function(`"use strict"; return (${clean})`)();
    if (!isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calc")
    .setDescription("Evaluate a math expression")
    .addStringOption(o => o.setName("expression").setDescription("e.g. 2 + 2 * 10 / 4").setRequired(true)),

  async execute(interaction) {
    const expr   = interaction.options.getString("expression");
    const result = safeMath(expr);

    if (result === null) {
      return interaction.reply({ embeds: [error(interaction, "Invalid expression. Only numbers and `+ - * / % ^ ( )` are allowed.")], ephemeral: true });
    }

    return interaction.reply({
      embeds: [
        base(interaction)
          .setTitle("🧮 Calculator")
          .addFields(
            { name: "Expression", value: `\`\`\`\n${expr}\n\`\`\``, inline: false },
            { name: "Result",     value: `\`\`\`\n${result}\n\`\`\``,             inline: false },
          )
          .setColor(0x2b2d31),
      ],
    });
  },
};
