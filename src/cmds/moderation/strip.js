const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("strip")
    .setDescription("Remove all roles from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(o => o.setName("user").setDescription("The member to strip roles from").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for stripping roles")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Roles")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Roles")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });

    const hierarchyErr = memberHierarchyCheck(interaction, target);
    if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });

    const manageable = target.roles.cache.filter(r => r.id !== interaction.guild.id && r.position < interaction.guild.members.me.roles.highest.position);
    if (!manageable.size) return interaction.reply({ embeds: [error(interaction, "That member has no manageable roles.")], ephemeral: true });

    try {
      await target.roles.remove(manageable, reason);
      await interaction.reply({ embeds: [success(interaction, `Stripped **${manageable.size}** role(s) from **${target.user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to strip roles.")], ephemeral: true });
    }
  },
};
