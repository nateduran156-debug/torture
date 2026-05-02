const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set the mod-log channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o => o.setName("channel").setDescription("Log channel (leave empty to disable)").addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const channel = interaction.options.getChannel("channel");
    const cfg = getGuildConfig(interaction.guild.id);
    cfg.logChannel = channel?.id ?? null;
    saveGuildConfig(interaction.guild.id, cfg);

    const msg = channel ? `Log channel set to ${channel}.` : "Disabled mod logging.";
    await interaction.reply({ embeds: [success(interaction, msg)] });
  },
};
