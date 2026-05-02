const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hackban")
    .setDescription("Ban a user by ID who is not in the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(o => o.setName("userid").setDescription("The user ID to ban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the ban")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Ban Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Ban Members")], ephemeral: true });

    const userId = interaction.options.getString("userid").trim();
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!/^\d{17,19}$/.test(userId)) return interaction.reply({ embeds: [error(interaction, "Invalid user ID.")], ephemeral: true });

    try {
      const user = await interaction.client.users.fetch(userId);
      await interaction.guild.members.ban(userId, { reason: `[HACKBAN] ${reason}` });
      await interaction.reply({ embeds: [success(interaction, `Hackbanned **${user.tag}** (\`${userId}\`).\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to ban that user. Invalid ID or already banned.")], ephemeral: true });
    }
  },
};
