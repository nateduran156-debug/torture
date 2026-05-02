const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("View or modify bot settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("prefix").setDescription("Change the bot's prefix").addStringOption(o => o.setName("prefix").setDescription("New prefix").setRequired(true)))
    .addSubcommand(s => s.setName("dj").setDescription("Set the DJ role for music").addRoleOption(o => o.setName("role").setDescription("DJ role (leave empty to clear)")))
    .addSubcommand(s => s.setName("autoplay").setDescription("Toggle music autoplay").addStringOption(o => o.setName("state").setDescription("on or off").setRequired(true).addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })))
    .addSubcommand(s => s.setName("view").setDescription("View current settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "prefix") {
      const prefix = interaction.options.getString("prefix");
      if (prefix.length > 5) return interaction.reply({ embeds: [error(interaction, "Prefix must be 5 characters or less.")], ephemeral: true });
      cfg.prefix = prefix;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Prefix set to \`${prefix}\`.`)] });
    }
    if (sub === "dj") {
      const role = interaction.options.getRole("role");
      cfg.djRole = role?.id ?? null;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, role ? `DJ role set to **${role.name}**.` : "DJ role cleared.")] });
    }
    if (sub === "autoplay") {
      cfg.autoplay = interaction.options.getString("state") === "on";
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Autoplay is now **${cfg.autoplay ? "enabled" : "disabled"}**.`)] });
    }
    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, "Server Settings", null, [
        { name: "Prefix", value: cfg.prefix ?? ",", inline: true },
        { name: "DJ Role", value: cfg.djRole ? `<@&${cfg.djRole}>` : "None", inline: true },
        { name: "Autoplay", value: cfg.autoplay ? "On" : "Off", inline: true },
        { name: "Level System", value: cfg.levelEnabled ? "On" : "Off", inline: true },
        { name: "Jail Channel", value: cfg.jailChannel ? `<#${cfg.jailChannel}>` : "Not set", inline: true },
        { name: "Log Channels", value: Object.keys(cfg.logChannels ?? {}).length + " configured", inline: true },
      ])], ephemeral: true });
    }
  },
};
