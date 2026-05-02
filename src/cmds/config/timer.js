const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getTimers, saveTimers } = require("../../utils/database");
const { parseDuration, formatDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timer")
    .setDescription("Manage scheduled auto messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Add a scheduled message")
      .addChannelOption(o => o.setName("channel").setDescription("Channel to send to").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("interval").setDescription("Interval (min 10m, e.g. 1h, 12h, 1d)").setRequired(true))
      .addStringOption(o => o.setName("message").setDescription("Message to send").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a scheduled message").addStringOption(o => o.setName("channel_id").setDescription("Channel ID of the timer").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all timers")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const timers = getTimers(interaction.guild.id);

    if (sub === "add") {
      const channel = interaction.options.getChannel("channel");
      const intervalStr = interaction.options.getString("interval");
      const message = interaction.options.getString("message");
      const ms = parseDuration(intervalStr);
      if (!ms || ms < 10 * 60 * 1000) return interaction.reply({ embeds: [error(interaction, "Interval must be at least 10 minutes.")], ephemeral: true });
      if (timers.find(t => t.channelId === channel.id)) return interaction.reply({ embeds: [error(interaction, "A timer already exists for that channel.")], ephemeral: true });

      timers.push({ channelId: channel.id, guildId: interaction.guild.id, interval: ms, message, nextSend: Date.now() + ms });
      saveTimers(interaction.guild.id, timers);
      return interaction.reply({ embeds: [success(interaction, `Timer added: sends to ${channel} every **${formatDuration(ms)}**.`)] });
    }
    if (sub === "remove") {
      const channelId = interaction.options.getString("channel_id");
      const idx = timers.findIndex(t => t.channelId === channelId);
      if (idx < 0) return interaction.reply({ embeds: [error(interaction, "No timer found for that channel.")], ephemeral: true });
      timers.splice(idx, 1);
      saveTimers(interaction.guild.id, timers);
      return interaction.reply({ embeds: [success(interaction, `Removed timer for <#${channelId}>.`)] });
    }
    if (sub === "list") {
      if (!timers.length) return interaction.reply({ embeds: [info(interaction, null, "No timers configured.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, `Timers (${timers.length})`, timers.map(t => `<#${t.channelId}> — every **${formatDuration(t.interval)}**`).join("\n"))], ephemeral: true });
    }
  },
};
