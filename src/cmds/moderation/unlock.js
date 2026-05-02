const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName("channel").setDescription("Channel to unlock (defaults to current)"))
    .addStringOption(o => o.setName("reason").setDescription("Reason for unlocking")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Channels")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Channels")], ephemeral: true });

    const channel = interaction.options.getChannel("channel") ?? interaction.channel;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }, { reason });
      await interaction.reply({ embeds: [success(interaction, `🔓 Unlocked ${channel}.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to unlock that channel.")], ephemeral: true });
    }
  },
};
