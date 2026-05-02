const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("boost")
    .setDescription("Configure the boost message")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Set the boost channel and message")
      .addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("message").setDescription("Message. Use {user}, {server}")))
    .addSubcommand(s => s.setName("remove").setDescription("Disable boost messages"))
    .addSubcommand(s => s.setName("view").setDescription("View current boost message settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "add") {
      const channel = interaction.options.getChannel("channel");
      const message = interaction.options.getString("message") ?? "🎉 **{user}** just boosted **{server}**! Thank you!";
      cfg.boostChannel = channel.id;
      cfg.boostMessage = message;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Boost messages will be sent to ${channel}.`)] });
    }
    if (sub === "remove") {
      cfg.boostChannel = null;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, "Disabled boost messages.")] });
    }
    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, "Boost Message Settings", null, [
        { name: "Channel", value: cfg.boostChannel ? `<#${cfg.boostChannel}>` : "Not set", inline: true },
        { name: "Message", value: cfg.boostMessage ?? "Default", inline: false },
      ])], ephemeral: true });
    }
  },
};
