const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(o => o.setName("user").setDescription("User ID or tag to unban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the unban")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Ban Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Ban Members")], ephemeral: true });

    const input = interaction.options.getString("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    try {
      const bans = await interaction.guild.bans.fetch();
      const banned = bans.find(b => b.user.id === input || b.user.tag.toLowerCase() === input.toLowerCase());
      if (!banned) return interaction.reply({ embeds: [error(interaction, `Could not find a banned user matching \`${input}\`.`)], ephemeral: true });

      await interaction.guild.members.unban(banned.user.id, reason);
      await interaction.reply({ embeds: [success(interaction, `Successfully unbanned **${banned.user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to unban that user.")], ephemeral: true });
    }
  },
};
