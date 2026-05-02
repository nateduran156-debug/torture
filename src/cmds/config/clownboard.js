const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clownboard")
    .setDescription("Configure the clownboard (shame board)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("set").setDescription("Set the clownboard channel").addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true).addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(s => s.setName("lock").setDescription("Lock the clownboard"))
    .addSubcommand(s => s.setName("unlock").setDescription("Unlock the clownboard"))
    .addSubcommand(s => s.setName("threshold").setDescription("Set the clown threshold").addIntegerOption(o => o.setName("amount").setDescription("Reactions needed").setRequired(true).setMinValue(1).setMaxValue(100)))
    .addSubcommand(s => s.setName("emoji").setDescription("Set the clownboard emoji").addStringOption(o => o.setName("emoji").setDescription("Emoji").setRequired(true)))
    .addSubcommand(s => s.setName("view").setDescription("View clownboard settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "set") { cfg.clownboardChannel = interaction.options.getChannel("channel").id; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Clownboard channel set to ${interaction.options.getChannel("channel")}.`)] }); }
    if (sub === "lock") { cfg.clownboardLocked = true; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, "Clownboard locked.")] }); }
    if (sub === "unlock") { cfg.clownboardLocked = false; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, "Clownboard unlocked.")] }); }
    if (sub === "threshold") { cfg.clownboardThreshold = interaction.options.getInteger("amount"); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Clownboard threshold set to **${cfg.clownboardThreshold}** reactions.`)] }); }
    if (sub === "emoji") { cfg.clownboardEmoji = interaction.options.getString("emoji"); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Clownboard emoji set to ${cfg.clownboardEmoji}.`)] }); }
    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, "Clownboard Settings", null, [
        { name: "Channel", value: cfg.clownboardChannel ? `<#${cfg.clownboardChannel}>` : "Not set", inline: true },
        { name: "Emoji", value: cfg.clownboardEmoji ?? "🤡", inline: true },
        { name: "Threshold", value: `${cfg.clownboardThreshold ?? 3}`, inline: true },
        { name: "Locked", value: cfg.clownboardLocked ? "Yes" : "No", inline: true },
      ])], ephemeral: true });
    }
  },
};
