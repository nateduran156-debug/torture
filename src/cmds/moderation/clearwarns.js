const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");
const { clearWarnings, getWarnings } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Clear all warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to clear warnings for").setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });

    const user = interaction.options.getUser("user");
    const warns = getWarnings(interaction.guild.id, user.id);

    if (!warns.length) return interaction.reply({ embeds: [error(interaction, `**${user.tag}** has no warnings to clear.`)], ephemeral: true });

    clearWarnings(interaction.guild.id, user.id);
    await interaction.reply({ embeds: [success(interaction, `Cleared all **${warns.length}** warning(s) for **${user.tag}**.`)] });
  },
};
