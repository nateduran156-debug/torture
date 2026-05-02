const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");
const { memberHierarchyCheck, parseDuration, formatDuration } = require("../../utils/permissions");
const { getTempbans, saveTempbans } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName("user").setDescription("The user to temp-ban").setRequired(true))
    .addStringOption(o => o.setName("duration").setDescription("Ban duration (e.g. 1d, 12h, 1w)").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the ban")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Ban Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Ban Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const user = interaction.options.getUser("user");
    const durationStr = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const ms = parseDuration(durationStr);

    if (!ms) return interaction.reply({ embeds: [error(interaction, "Invalid duration. Use formats like `1h`, `1d`, `1w`.")], ephemeral: true });

    if (target) {
      const hierarchyErr = memberHierarchyCheck(interaction, target);
      if (hierarchyErr) return interaction.reply({ embeds: [error(interaction, hierarchyErr)], ephemeral: true });
    }

    try {
      await user.send({ embeds: [error(interaction, `You have been **temporarily banned** from **${interaction.guild.name}** for **${formatDuration(ms)}**.\n**Reason:** ${reason}`)] }).catch(() => {});
      await interaction.guild.members.ban(user, { reason: `[Tempban ${formatDuration(ms)}] ${reason}` });

      const bans = getTempbans();
      bans[`${interaction.guild.id}_${user.id}`] = { guildId: interaction.guild.id, userId: user.id, unbanAt: Date.now() + ms, reason };
      saveTempbans(bans);

      setTimeout(async () => {
        try {
          await interaction.guild.members.unban(user.id, "Tempban expired");
          const updated = getTempbans();
          delete updated[`${interaction.guild.id}_${user.id}`];
          saveTempbans(updated);
        } catch {}
      }, ms);

      await interaction.reply({ embeds: [success(interaction, `Temp-banned **${user.tag}** for **${formatDuration(ms)}**.\n**Reason:** ${reason}\n**Unbans:** <t:${Math.floor((Date.now() + ms) / 1000)}:R>`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to temp-ban that user.")], ephemeral: true });
    }
  },
};
