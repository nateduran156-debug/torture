const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move a member to a voice channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .addUserOption(o => o.setName("user").setDescription("The member to move").setRequired(true))
    .addChannelOption(o => o.setName("channel").setDescription("Voice channel to move them to").setRequired(true).addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers))
      return interaction.reply({ embeds: [noPerms(interaction, "Move Members")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Move Members")], ephemeral: true });

    const target = interaction.options.getMember("user");
    const channel = interaction.options.getChannel("channel");

    if (!target) return interaction.reply({ embeds: [error(interaction, "That user is not in this server.")], ephemeral: true });
    if (!target.voice.channel) return interaction.reply({ embeds: [error(interaction, "That member is not in a voice channel.")], ephemeral: true });

    try {
      await target.voice.setChannel(channel);
      await interaction.reply({ embeds: [success(interaction, `Moved **${target.user.tag}** to ${channel}.`)] });
    } catch {
      await interaction.reply({ embeds: [error(interaction, "Failed to move that member.")], ephemeral: true });
    }
  },
};
