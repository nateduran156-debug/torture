const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { info, error, noPerms } = require("../../utils/embed");
const { getWarnings } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to check").setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Moderate Members")], ephemeral: true });

    const user = interaction.options.getUser("user");
    const warns = getWarnings(interaction.guild.id, user.id);

    if (!warns.length) return interaction.reply({ embeds: [info(interaction, null, `**${user.tag}** has no warnings.`)] });

    const embed = info(interaction, `Warnings for ${user.tag}`, `**${warns.length}** warning(s) on record.`);
    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
    warns.slice(0, 10).forEach((w, i) => {
      embed.addFields({ name: `#${i + 1} — <@${w.moderator}>`, value: `${w.reason}\n<t:${Math.floor(w.timestamp / 1000)}:R>`, inline: false });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
