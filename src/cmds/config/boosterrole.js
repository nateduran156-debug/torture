const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig, getBoosterRole, saveBoosterRole, deleteBoosterRole } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("boosterrole")
    .setDescription("Manage your custom booster role")
    .addSubcommand(s => s.setName("create").setDescription("Create your booster role").addStringOption(o => o.setName("color").setDescription("Hex color (e.g. #ff5733)").setRequired(true)).addStringOption(o => o.setName("name").setDescription("Role name").setRequired(true)))
    .addSubcommand(s => s.setName("color").setDescription("Change your booster role color").addStringOption(o => o.setName("color").setDescription("Hex color").setRequired(true)))
    .addSubcommand(s => s.setName("rename").setDescription("Rename your booster role").addStringOption(o => o.setName("name").setDescription("New name").setRequired(true)))
    .addSubcommand(s => s.setName("delete").setDescription("Delete your booster role"))
    .addSubcommand(s => s.setName("base").setDescription("(Admin) Set the base role for booster roles").addRoleOption(o => o.setName("role").setDescription("Base role").setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.member;

    if (sub === "base") {
      if (!member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });
      const role = interaction.options.getRole("role");
      const cfg = getGuildConfig(interaction.guild.id);
      cfg.boosterRoleBase = role.id;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Set booster role base to **${role.name}**.`)] });
    }

    if (!member.premiumSince) return interaction.reply({ embeds: [error(interaction, "You must be a server booster to use this command.")], ephemeral: true });

    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.boosterRoleBase) return interaction.reply({ embeds: [error(interaction, "No booster role base set. Ask an admin to use `/boosterrole base`.")], ephemeral: true });

    const baseRole = interaction.guild.roles.cache.get(cfg.boosterRoleBase);
    if (!baseRole) return interaction.reply({ embeds: [error(interaction, "Base role not found.")], ephemeral: true });

    if (sub === "create") {
      if (getBoosterRole(interaction.guild.id, interaction.user.id)) return interaction.reply({ embeds: [error(interaction, "You already have a booster role. Use `/boosterrole color` or `/boosterrole rename`.")], ephemeral: true });
      const color = interaction.options.getString("color");
      const name = interaction.options.getString("name");
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return interaction.reply({ embeds: [error(interaction, "Invalid hex color.")], ephemeral: true });
      try {
        const role = await interaction.guild.roles.create({ name, color, position: baseRole.position, reason: `Booster role for ${interaction.user.tag}` });
        await member.roles.add(role);
        saveBoosterRole(interaction.guild.id, interaction.user.id, role.id);
        await interaction.reply({ embeds: [success(interaction, `Created your booster role **${role.name}** with color \`${color}\`!`)] });
      } catch { await interaction.reply({ embeds: [error(interaction, "Failed to create role.")], ephemeral: true }); }

    } else if (sub === "color") {
      const roleId = getBoosterRole(interaction.guild.id, interaction.user.id);
      if (!roleId) return interaction.reply({ embeds: [error(interaction, "You don't have a booster role. Use `/boosterrole create`.")], ephemeral: true });
      const color = interaction.options.getString("color");
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return interaction.reply({ embeds: [error(interaction, "Invalid hex color.")], ephemeral: true });
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.reply({ embeds: [error(interaction, "Role not found.")], ephemeral: true });
      await role.setColor(color);
      await interaction.reply({ embeds: [success(interaction, `Updated your booster role color to \`${color}\`.`)] });

    } else if (sub === "rename") {
      const roleId = getBoosterRole(interaction.guild.id, interaction.user.id);
      if (!roleId) return interaction.reply({ embeds: [error(interaction, "You don't have a booster role.")], ephemeral: true });
      const name = interaction.options.getString("name");
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.reply({ embeds: [error(interaction, "Role not found.")], ephemeral: true });
      await role.setName(name);
      await interaction.reply({ embeds: [success(interaction, `Renamed your booster role to **${name}**.`)] });

    } else if (sub === "delete") {
      const roleId = getBoosterRole(interaction.guild.id, interaction.user.id);
      if (!roleId) return interaction.reply({ embeds: [error(interaction, "You don't have a booster role.")], ephemeral: true });
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) await role.delete().catch(() => {});
      deleteBoosterRole(interaction.guild.id, interaction.user.id);
      await interaction.reply({ embeds: [success(interaction, "Deleted your booster role.")] });
    }
  },
};
