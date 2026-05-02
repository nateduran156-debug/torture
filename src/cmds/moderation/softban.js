const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("Ban and immediately unban a member to delete their messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to softban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the softban")),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Ban Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Ban Members")], ephemeral: true });

    if (target) {
      const hierarchyErr = memberHierarchyCheck(interaction, target);
      if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });
    }

    try {
      await interaction.guild.members.ban(user, { reason, deleteMessageSeconds: 7 * 86400 });
      await interaction.guild.members.unban(user.id, "softban — auto unban");
      await interaction.reply({ embeds: [success(interaction, `Successfully softbanned **${user.tag}** (messages deleted).\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to softban that user.")], ephemeral: true });
    }
  },
};
