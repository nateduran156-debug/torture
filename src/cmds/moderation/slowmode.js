const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set the slowmode for a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(o => o.setName("seconds").setDescription("Slowmode duration in seconds (0 to disable)").setRequired(true).setMinValue(0).setMaxValue(21600))
    .addChannelOption(o => o.setName("channel").setDescription("Channel to set slowmode in")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Channels")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Channels")], ephemeral: true });

    const seconds = interaction.options.getInteger("seconds");
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;

    try {
      await channel.setRateLimitPerUser(seconds);
      const msg = seconds === 0 ? `Disabled slowmode in ${channel}.` : `Set slowmode to **${seconds}s** in ${channel}.`;
      await interaction.reply({ embeds: [success(interaction, msg)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to set slowmode.")], ephemeral: true });
    }
  },
};
