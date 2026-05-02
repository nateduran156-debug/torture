const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");
const { addWarning } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to warn").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the warning").setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });
    if (user.bot) return interaction.reply({ embeds: [error(interaction, "You cannot warn a bot.")], ephemeral: true });

    const warn = { reason, moderator: interaction.user.id, timestamp: Date.now() };
    const count = addWarning(interaction.guild.id, user.id, warn);

    await target.send({ embeds: [error(interaction, `You have received a **warning** in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${count}`)] }).catch(() => {});
    await interaction.reply({ embeds: [success(interaction, `Warned **${user.tag}** (warning #${count}).\n**Reason:** ${reason}`)] });
  },
};
