const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Configure a role to give to new members")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("set").setDescription("Set the autorole").addRoleOption(o => o.setName("role").setDescription("Role to assign on join").setRequired(true)))
    .addSubcommand(s => s.setName("disable").setDescription("Disable autorole"))
    .addSubcommand(s => s.setName("view").setDescription("View current autorole")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "set") {
      const role = interaction.options.getRole("role");
      if (role.position >= interaction.guild.members.me.roles.highest.position)
        return interaction.reply({ embeds: [error(interaction, "That role is above my highest role.")], ephemeral: true });
      cfg.autorole = role.id;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, `New members will receive the **${role.name}** role.`)] });

    } else if (sub === "disable") {
      cfg.autorole = null;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, "Disabled autorole.")] });

    } else if (sub === "view") {
      const role = cfg.autorole ? `<@&${cfg.autorole}>` : "Not set";
      await interaction.reply({ embeds: [info(interaction, "Autorole Settings", null, [{ name: "Role", value: role }])], ephemeral: true });
    }
  },
};
