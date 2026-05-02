const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");

const DANGEROUS_PERMS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageWebhooks,
  PermissionFlagsBits.MentionEveryone,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stripstaff")
    .setDescription("Remove dangerous permissions from a staff member's roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Member to strip").setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [noPerms(interaction, "Administrator")], ephemeral: true });

    const target = interaction.options.getMember("user");
    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });
    if (target.id === interaction.guild.ownerId) return interaction.reply({ embeds: [error(interaction, "Cannot strip the server owner.")], ephemeral: true });

    await interaction.deferReply();
    let stripped = 0;

    for (const [, role] of target.roles.cache) {
      if (role.id === interaction.guild.id) continue;
      if (role.managed) continue;

      const dangerousBits = DANGEROUS_PERMS.reduce((acc, p) => (role.permissions.has(p) ? acc | p : acc), BigInt(0));
      if (!dangerousBits) continue;

      try {
        const newPerms = role.permissions.remove(DANGEROUS_PERMS);
        await role.setPermissions(newPerms, `Dangerous permissions stripped by ${interaction.user.tag}`);
        stripped++;
      } catch {}
    }

    await interaction.editReply({ embeds: [success(interaction, `Stripped dangerous permissions from **${stripped}** role(s) for **${target.user.tag}**.`)] });
  },
};
