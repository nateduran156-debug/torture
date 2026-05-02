const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bind")
    .setDescription("Manage staff role bindings")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("staff").setDescription("Toggle a staff role").addRoleOption(o => o.setName("role").setDescription("Role to toggle as staff").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all bound staff roles")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [noPerms(interaction, "Administrator")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.staffRoles) cfg.staffRoles = [];

    if (sub === "staff") {
      const role = interaction.options.getRole("role");
      const idx = cfg.staffRoles.indexOf(role.id);
      if (idx >= 0) {
        cfg.staffRoles.splice(idx, 1);
        saveGuildConfig(interaction.guild.id, cfg);
        return interaction.reply({ embeds: [success(interaction, `Removed **${role.name}** from staff roles.`)] });
      }
      cfg.staffRoles.push(role.id);
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Added **${role.name}** as a staff role.`)] });
    }
    if (sub === "list") {
      if (!cfg.staffRoles.length) return interaction.reply({ embeds: [info(interaction, null, "No staff roles bound.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, "Staff Roles", cfg.staffRoles.map(id => `<@&${id}>`).join("\n"))], ephemeral: true });
    }
  },
};
