const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");
const { getGuildConfig, getJailed, saveJailed } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jail")
    .setDescription("Restrict a member to the jail channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to jail").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for jailing")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const cfg = getGuildConfig(interaction.guild.id);

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });
    if (!cfg.jailRole) return interaction.reply({ embeds: [error(interaction, "No jail role set. Use `/setup` first.")], ephemeral: true });

    const hierarchyErr = memberHierarchyCheck(interaction, target);
    if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });

    const jailRole = interaction.guild.roles.cache.get(cfg.jailRole);
    if (!jailRole) return interaction.reply({ embeds: [error(interaction, "Jail role not found. Please re-run `/setup`.")], ephemeral: true });

    try {
      const savedRoles = target.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.id);
      const jailed = getJailed(interaction.guild.id);
      jailed[target.id] = { roles: savedRoles, reason, moderator: interaction.user.id, jailedAt: Date.now() };
      saveJailed(interaction.guild.id, jailed);

      await target.roles.set([jailRole], `Jailed by ${interaction.user.tag}: ${reason}`);
      await target.send({ embeds: [error(interaction, `You have been **jailed** in **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
      await interaction.reply({ embeds: [success(interaction, `Jailed **${target.user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to jail that member.")], ephemeral: true });
    }
  },
};
