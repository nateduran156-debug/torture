const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hardban")
    .setDescription("Permanently ban a user and delete all their messages (7 days)")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName("user").setDescription("The user to hardban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the hardban")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Ban Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Ban Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (target) {
      const hierarchyErr = memberHierarchyCheck(interaction, target);
      if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });
    }

    try {
      await user.send({ embeds: [error(interaction, `You have been **permanently banned** from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
      await interaction.guild.members.ban(user, { reason: `[HARDBAN] ${reason}`, deleteMessageSeconds: 7 * 86400 });
      await interaction.reply({ embeds: [success(interaction, `Hardbanned **${user.tag}** and deleted 7 days of messages.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to hardban that user.")], ephemeral: true });
    }
  },
};
