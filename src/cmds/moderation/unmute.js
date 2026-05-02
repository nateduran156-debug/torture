const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove the timeout from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to unmute").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the unmute")),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Moderate Members")], ephemeral: true });
    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });

    if (!target.isCommunicationDisabled())
      return interaction.reply({ embeds: [error(interaction, "That member is not currently muted.")], ephemeral: true });

    try {
      await target.timeout(null, reason);
      await interaction.reply({ embeds: [success(interaction, `Successfully unmuted **${target.user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to unmute that member.")], ephemeral: true });
    }
  },
};
