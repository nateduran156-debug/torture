const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");
const { removeWarning, getWarnings } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delwarn")
    .setDescription("Delete a specific warning from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member").setRequired(true))
    .addIntegerOption(o => o.setName("index").setDescription("Warning number to delete").setRequired(true).setMinValue(1)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });

    const user = interaction.options.getUser("user");
    const index = interaction.options.getInteger("index") - 1;
    const warns = getWarnings(interaction.guild.id, user.id);

    if (!warns.length) return interaction.reply({ embeds: [error(interaction, `**${user.tag}** has no warnings.`)], ephemeral: true });
    if (index < 0 || index >= warns.length) return interaction.reply({ embeds: [error(interaction, `Invalid warning index. They have **${warns.length}** warning(s).`)], ephemeral: true });

    removeWarning(interaction.guild.id, user.id, index);
    await interaction.reply({ embeds: [success(interaction, `Deleted warning #${index + 1} for **${user.tag}**.`)] });
  },
};
