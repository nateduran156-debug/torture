const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

const EVENTS = ["messages", "members", "roles", "channels", "invites", "emojis", "voice", "modlog"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("Configure logging")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Add a logging event")
      .addChannelOption(o => o.setName("channel").setDescription("Log channel").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("event").setDescription("Event to log").setRequired(true).addChoices(...EVENTS.map(e => ({ name: e, value: e })))))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a logging event")
      .addStringOption(o => o.setName("event").setDescription("Event to remove").setRequired(true).addChoices(...EVENTS.map(e => ({ name: e, value: e })))))
    .addSubcommand(s => s.setName("list").setDescription("List all logging events")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.logChannels) cfg.logChannels = {};

    if (sub === "add") {
      const channel = interaction.options.getChannel("channel");
      const event = interaction.options.getString("event");
      cfg.logChannels[event] = channel.id;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Logging **${event}** events to ${channel}.`)] });
    }
    if (sub === "remove") {
      const event = interaction.options.getString("event");
      delete cfg.logChannels[event];
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Removed logging for **${event}** events.`)] });
    }
    if (sub === "list") {
      const entries = Object.entries(cfg.logChannels ?? {});
      if (!entries.length) return interaction.reply({ embeds: [info(interaction, null, "No logging events configured.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, "Log Channels", entries.map(([e, id]) => `**${e}** → <#${id}>`).join("\n"))], ephemeral: true });
    }
  },
};
