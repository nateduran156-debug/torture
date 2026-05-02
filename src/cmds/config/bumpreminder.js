const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bumpreminder")
    .setDescription("Configure DISBOARD bump reminders")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("set").setDescription("Set the bump reminder channel")
      .addChannelOption(o => o.setName("channel").setDescription("Channel for reminders").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addRoleOption(o => o.setName("role").setDescription("Role to ping (optional)")))
    .addSubcommand(s => s.setName("disable").setDescription("Disable bump reminders"))
    .addSubcommand(s => s.setName("view").setDescription("View bump reminder settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "set") {
      const channel = interaction.options.getChannel("channel");
      const role = interaction.options.getRole("role");
      cfg.bumpReminder = { channelId: channel.id, roleId: role?.id ?? null };
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Bump reminders will be sent to ${channel}${role ? ` (pings ${role})` : ""}.`)] });
    }
    if (sub === "disable") {
      cfg.bumpReminder = null;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, "Disabled bump reminders.")] });
    }
    if (sub === "view") {
      const br = cfg.bumpReminder;
      return interaction.reply({ embeds: [info(interaction, "Bump Reminder Settings", br
        ? `**Channel:** <#${br.channelId}>\n**Role:** ${br.roleId ? `<@&${br.roleId}>` : "None"}`
        : "Not configured.")], ephemeral: true });
    }
  },
};
