const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stealemoji")
    .setDescription("Steal an emoji and add it to this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
    .addStringOption(o => o.setName("emoji").setDescription("The emoji to steal").setRequired(true))
    .addStringOption(o => o.setName("name").setDescription("Name for the emoji (optional)")),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Emojis")], ephemeral: true });

    const raw = interaction.options.getString("emoji");
    const match = raw.match(/<(?:a?):(\w+):(\d+)>/);
    if (!match) return interaction.reply({ embeds: [error(interaction, "Provide a custom Discord emoji to steal.")], ephemeral: true });

    const [, originalName, id] = match;
    const isAnimated = raw.startsWith("<a:");
    const name = interaction.options.getString("name") ?? originalName;
    const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? "gif" : "png"}`;

    try {
      const emoji = await interaction.guild.emojis.create({ attachment: url, name });
      await interaction.reply({ embeds: [success(interaction, `Added emoji ${emoji} **:${emoji.name}:**`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to add the emoji. Check my permissions and the server emoji limit.")], ephemeral: true });
    }
  },
};
