const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

const EMOJI_REGEX = /<a?:(\w+):(\d+)>/;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steal")
    .setDescription("Steal an emoji from another server and add it here")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
    .addStringOption(o => o.setName("emoji").setDescription("The emoji to steal").setRequired(true))
    .addStringOption(o => o.setName("name").setDescription("Custom name for the emoji")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Emojis")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Emojis")], ephemeral: true });

    const input = interaction.options.getString("emoji");
    const match = input.match(EMOJI_REGEX);
    if (!match) return interaction.reply({ embeds: [error(interaction, "Please provide a valid custom emoji.")], ephemeral: true });

    const [, emojiName, emojiId] = match;
    const animated = input.startsWith("<a:");
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? "gif" : "png"}`;
    const name = interaction.options.getString("name") ?? emojiName;

    try {
      const emoji = await interaction.guild.emojis.create({ attachment: url, name });
      await interaction.reply({ embeds: [success(interaction, `Added emoji ${emoji} as **:${emoji.name}:**`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to add emoji. The server may be at its emoji limit.")], ephemeral: true });
    }
  },
};
