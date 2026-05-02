const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change a member's nickname")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption(o => o.setName("user").setDescription("The member to rename").setRequired(true))
    .addStringOption(o => o.setName("nickname").setDescription("New nickname (leave empty to reset)")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Nicknames")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Nicknames")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const nick = interaction.options.getString("nickname") ?? null;

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });

    const hierarchyErr = memberHierarchyCheck(interaction, target);
    if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });

    try {
      await target.setNickname(nick);
      const msg = nick ? `Set **${target.user.tag}**'s nickname to **${nick}**.` : `Reset **${target.user.tag}**'s nickname.`;
      await interaction.reply({ embeds: [success(interaction, msg)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to change that nickname.")], ephemeral: true });
    }
  },
};
