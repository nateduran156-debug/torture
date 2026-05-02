const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Add or remove a role from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(o => o.setName("user").setDescription("The member").setRequired(true))
    .addRoleOption(o => o.setName("role").setDescription("The role to add or remove").setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Roles")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Roles")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });
    if (role.position >= interaction.guild.members.me.roles.highest.position)
      return interaction.reply({ embeds: [error(interaction, "That role is above my highest role.")], ephemeral: true });

    const hierarchyErr = memberHierarchyCheck(interaction, target);
    if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });

    try {
      if (target.roles.cache.has(role.id)) {
        await target.roles.remove(role);
        await interaction.reply({ embeds: [success(interaction, `Removed role **${role.name}** from **${target.user.tag}**.`)] });
      } else {
        await target.roles.add(role);
        await interaction.reply({ embeds: [success(interaction, `Added role **${role.name}** to **${target.user.tag}**.`)] });
      }
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to modify that role.")], ephemeral: true });
    }
  },
};
