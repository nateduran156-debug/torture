const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck, parseDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName("user").setDescription("The user to ban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the ban"))
    .addIntegerOption(o => o.setName("days").setDescription("Days of messages to delete (0-7)").setMinValue(0).setMaxValue(7)),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const days = interaction.options.getInteger("days") ?? 0;

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Ban Members")], ephemeral: true });

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Ban Members")], ephemeral: true });

    if (target) {
      const hierarchyErr = memberHierarchyCheck(interaction, target);
      if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });
    }

    try {
      await user.send({ embeds: [error(interaction, `You have been **banned** from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
      await interaction.guild.members.ban(user, { reason, deleteMessageSeconds: days * 86400 });
      await interaction.reply({ embeds: [success(interaction, `Successfully banned **${user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to ban that user.")], ephemeral: true });
    }
  },
};
