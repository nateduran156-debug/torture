const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to kick").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the kick")),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Kick Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Kick Members")], ephemeral: true });
    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });

    const hierarchyErr = memberHierarchyCheck(interaction, target);
    if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });

    try {
      await target.send({ embeds: [error(interaction, `You have been **kicked** from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
      await target.kick(reason);
      await interaction.reply({ embeds: [success(interaction, `Successfully kicked **${target.user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to kick that member.")], ephemeral: true });
    }
  },
};
