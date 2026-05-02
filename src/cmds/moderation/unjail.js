const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");
const { getJailed, saveJailed } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unjail")
    .setDescription("Release a member from jail")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to unjail").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for unjailing")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });

    const jailed = getJailed(interaction.guild.id);
    if (!jailed[target.id]) return interaction.reply({ embeds: [error(interaction, "That member is not currently jailed.")], ephemeral: true });

    const savedRoles = jailed[target.id].roles ?? [];
    delete jailed[target.id];
    saveJailed(interaction.guild.id, jailed);

    try {
      const roles = savedRoles.filter(id => interaction.guild.roles.cache.has(id));
      await target.roles.set(roles, `Unjailed by ${interaction.user.tag}: ${reason}`);
      await interaction.reply({ embeds: [success(interaction, `Unjailed **${target.user.tag}** and restored their roles.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to restore roles, but jail data was cleared.")], ephemeral: true });
    }
  },
};
