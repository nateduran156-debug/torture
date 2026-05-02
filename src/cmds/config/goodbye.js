const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("goodbye")
    .setDescription("Configure the goodbye message")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("set").setDescription("Set the goodbye channel and message")
      .addChannelOption(o => o.setName("channel").setDescription("Channel to send goodbye messages in").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("message").setDescription("Goodbye message. Use {user}, {server}")))
    .addSubcommand(s => s.setName("disable").setDescription("Disable goodbye messages"))
    .addSubcommand(s => s.setName("view").setDescription("View current goodbye settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "set") {
      const channel = interaction.options.getChannel("channel");
      const message = interaction.options.getString("message") ?? "**{user}** has left **{server}**. Goodbye!";
      cfg.goodbyeChannel = channel.id;
      cfg.goodbyeMessage = message;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, `Goodbye messages will be sent to ${channel}.\n**Message:** ${message}`)] });

    } else if (sub === "disable") {
      cfg.goodbyeChannel = null;
      saveGuildConfig(interaction.guild.id, cfg);
      await interaction.reply({ embeds: [success(interaction, "Disabled goodbye messages.")] });

    } else if (sub === "view") {
      const channel = cfg.goodbyeChannel ? `<#${cfg.goodbyeChannel}>` : "Not set";
      await interaction.reply({ embeds: [info(interaction, "Goodbye Settings", null, [
        { name: "Channel", value: channel, inline: true },
        { name: "Message", value: cfg.goodbyeMessage ?? "Default", inline: false },
      ])], ephemeral: true });
    }
  },
};
