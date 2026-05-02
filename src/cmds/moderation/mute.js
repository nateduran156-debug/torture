const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck, parseDuration, formatDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to mute").setRequired(true))
    .addStringOption(o => o.setName("duration").setDescription("Duration (e.g. 10m, 1h, 1d)").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the mute")),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const durationStr = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Moderate Members")], ephemeral: true });
    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });

    const hierarchyErr = memberHierarchyCheck(interaction, target);
    if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });

    const ms = parseDuration(durationStr);
    if (!ms) return interaction.reply({ embeds: [error(interaction, "Invalid duration. Use formats like `10m`, `1h`, `2d`.")], ephemeral: true });
    if (ms > 28 * 24 * 60 * 60 * 1000) return interaction.reply({ embeds: [error(interaction, "Timeout cannot exceed 28 days.")], ephemeral: true });

    try {
      await target.timeout(ms, reason);
      await interaction.reply({ embeds: [success(interaction, `Successfully muted **${target.user.tag}** for **${formatDuration(ms)}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to mute that member.")], ephemeral: true });
    }
  },
};
