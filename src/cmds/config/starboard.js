const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("Configure the starboard")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("set").setDescription("Set the starboard channel").addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true).addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(s => s.setName("lock").setDescription("Lock the starboard"))
    .addSubcommand(s => s.setName("unlock").setDescription("Unlock the starboard"))
    .addSubcommand(s => s.setName("threshold").setDescription("Set the star threshold").addIntegerOption(o => o.setName("amount").setDescription("Stars needed").setRequired(true).setMinValue(1).setMaxValue(100)))
    .addSubcommand(s => s.setName("emoji").setDescription("Set the starboard emoji").addStringOption(o => o.setName("emoji").setDescription("Emoji to use").setRequired(true)))
    .addSubcommand(s => s.setName("ignore").setDescription("Toggle ignore for a channel/role/member").addMentionableOption(o => o.setName("target").setDescription("Channel, role, or user to ignore").setRequired(true)))
    .addSubcommand(s => s.setName("view").setDescription("View starboard settings")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.starboardIgnore) cfg.starboardIgnore = [];

    if (sub === "set") {
      cfg.starboardChannel = interaction.options.getChannel("channel").id;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Starboard channel set to ${interaction.options.getChannel("channel")}.`)] });
    }
    if (sub === "lock") { cfg.starboardLocked = true; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, "Starboard locked.")] }); }
    if (sub === "unlock") { cfg.starboardLocked = false; saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, "Starboard unlocked.")] }); }
    if (sub === "threshold") { cfg.starboardThreshold = interaction.options.getInteger("amount"); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Starboard threshold set to **${cfg.starboardThreshold}** stars.`)] }); }
    if (sub === "emoji") { cfg.starboardEmoji = interaction.options.getString("emoji"); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Starboard emoji set to ${cfg.starboardEmoji}.`)] }); }
    if (sub === "ignore") {
      const target = interaction.options.getMentionable("target");
      const id = target.id;
      const idx = cfg.starboardIgnore.indexOf(id);
      if (idx >= 0) { cfg.starboardIgnore.splice(idx, 1); saveGuildConfig(interaction.guild.id, cfg); return interaction.reply({ embeds: [success(interaction, `Removed ${target} from starboard ignore list.`)] }); }
      cfg.starboardIgnore.push(id);
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Added ${target} to starboard ignore list.`)] });
    }
    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, "Starboard Settings", null, [
        { name: "Channel", value: cfg.starboardChannel ? `<#${cfg.starboardChannel}>` : "Not set", inline: true },
        { name: "Emoji", value: cfg.starboardEmoji ?? "⭐", inline: true },
        { name: "Threshold", value: `${cfg.starboardThreshold ?? 3}`, inline: true },
        { name: "Locked", value: cfg.starboardLocked ? "Yes" : "No", inline: true },
        { name: "Ignored", value: cfg.starboardIgnore.length ? cfg.starboardIgnore.map(id => `<#${id}>`).join(", ") : "None", inline: false },
      ])], ephemeral: true });
    }
  },
};
