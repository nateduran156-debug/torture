const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leveling")
    .setDescription("Configure the leveling system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("enable").setDescription("Enable leveling in this server"))
    .addSubcommand(s => s.setName("disable").setDescription("Disable leveling in this server"))
    .addSubcommand(s => s.setName("channel").setDescription("Set level-up announcement channel")
      .addChannelOption(o => o.setName("channel").setDescription("Channel for level-up messages (leave empty to message in current channel)").addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(s => s.setName("view").setDescription("View current leveling settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "enable") {
      cfg.levelEnabled = true;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, "Leveling is now **enabled**.")] });

    } else if (sub === "disable") {
      cfg.levelEnabled = false;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, "Leveling is now **disabled**.")] });

    } else if (sub === "channel") {
      const channel = interaction.options.getChannel("channel");
      cfg.levelChannel = channel?.id ?? null;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, channel ? `Level-up messages will go to ${channel}.` : "Level-up messages will be sent in the current channel.")] });

    } else if (sub === "view") {
      await interaction.reply({ embeds: [info(interaction, "Leveling Settings", null, [
        { name: "Enabled", value: cfg.levelEnabled ? "Yes" : "No", inline: true },
        { name: "Channel", value: cfg.levelChannel ? `<#${cfg.levelChannel}>` : "Current channel", inline: true },
      ])], ephemeral: true });
    }
  },
};
