const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Configure welcome messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Set the welcome channel and message")
      .addChannelOption(o => o.setName("channel").setDescription("Channel for welcome messages").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("message").setDescription("Message. Variables: {user}, {user.mention}, {server}, {guild.name}, {count}")))
    .addSubcommand(s => s.setName("remove").setDescription("Disable welcome messages"))
    .addSubcommand(s => s.setName("view").setDescription("View current welcome settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "add") {
      const channel = interaction.options.getChannel("channel");
      const message = interaction.options.getString("message") ?? "Welcome to **{guild.name}**, {user.mention}! You are member #{count}.";
      cfg.welcomeChannel = channel.id;
      cfg.welcomeMessage = message;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Welcome messages enabled in ${channel}.\n**Message:** \`${message}\``)] });
    }
    if (sub === "remove") {
      cfg.welcomeChannel = null;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, "Welcome messages disabled.")] });
    }
    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, "Welcome Settings", null, [
        { name: "Channel", value: cfg.welcomeChannel ? `<#${cfg.welcomeChannel}>` : "Not set", inline: true },
        { name: "Message", value: cfg.welcomeMessage ?? "Default", inline: false },
      ])], ephemeral: true });
    }
  },
};
