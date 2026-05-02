const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel, preventing members from sending messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName("channel").setDescription("Channel to lock (defaults to current)"))
    .addStringOption(o => o.setName("reason").setDescription("Reason for locking")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Channels")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Channels")], ephemeral: true });

    const channel = interaction.options.getChannel("channel") ?? interaction.channel;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });
      await interaction.reply({ embeds: [success(interaction, `🔒 Locked ${channel}.\n**Reason:** ${reason}`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to lock that channel.")], ephemeral: true });
    }
  },
};
