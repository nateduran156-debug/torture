const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("undeafen")
    .setDescription("Undeafen a member in a voice channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to undeafen").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for undeafening")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.DeafenMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Deafen Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.DeafenMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Deafen Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });
    if (!target.voice.channel) return interaction.reply({ embeds: [error(interaction, "That member is not in a voice channel.")], ephemeral: true });

    try {
      await target.voice.setDeaf(false, reason);
      await interaction.reply({ embeds: [success(interaction, `Undeafened **${target.user.tag}**.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to undeafen that member.")], ephemeral: true });
    }
  },
};
