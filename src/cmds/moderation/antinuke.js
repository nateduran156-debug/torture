const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antinuke")
    .setDescription("Configure the anti-nuke system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("enable").setDescription("Enable anti-nuke"))
    .addSubcommand(s => s.setName("disable").setDescription("Disable anti-nuke"))
    .addSubcommand(s => s.setName("action").setDescription("Set punishment action")
      .addStringOption(o => o.setName("action").setDescription("Action to take").setRequired(true).addChoices(
        { name: "Ban", value: "ban" }, { name: "Kick", value: "kick" }, { name: "Strip (remove roles)", value: "strip" }
      )))
    .addSubcommand(s => s.setName("threshold").setDescription("Set the action threshold")
      .addIntegerOption(o => o.setName("amount").setDescription("Number of actions before triggering").setRequired(true).setMinValue(1).setMaxValue(20)))
    .addSubcommand(s => s.setName("view").setDescription("View current anti-nuke settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [noPerms(interaction, "Administrator")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.antinuke) cfg.antinuke = { enabled: false, threshold: 5, action: "ban" };

    if (sub === "enable") { cfg.antinuke.enabled = true; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, "Anti-nuke is now **enabled**.")] }); }
    if (sub === "disable") { cfg.antinuke.enabled = false; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, "Anti-nuke is now **disabled**.")] }); }
    if (sub === "action") { cfg.antinuke.action = interaction.options.getString("action"); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Anti-nuke action set to **${cfg.antinuke.action}**.`)] }); }
    if (sub === "threshold") { cfg.antinuke.threshold = interaction.options.getInteger("amount"); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Anti-nuke threshold set to **${cfg.antinuke.threshold}** actions.`)] }); }
    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, "Anti-Nuke Settings", null, [
        { name: "Enabled", value: cfg.antinuke.enabled ? "Yes" : "No", inline: true },
        { name: "Threshold", value: `${cfg.antinuke.threshold} actions`, inline: true },
        { name: "Action", value: cfg.antinuke.action, inline: true },
      ])], ephemeral: true });
    }
  },
};
