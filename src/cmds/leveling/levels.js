const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("levels")
    .setDescription("Configure the leveling system")
    .addSubcommand(s => s.setName("enable").setDescription("Enable the leveling system"))
    .addSubcommand(s => s.setName("disable").setDescription("Disable the leveling system"))
    .addSubcommand(s => s.setName("ignore").setDescription("Toggle ignore for a channel or role (won't gain XP)")
      .addMentionableOption(o => o.setName("target").setDescription("Channel or role to ignore").setRequired(true)))
    .addSubcommand(s => s.setName("channel").setDescription("Set the channel for level-up announcements")
      .addChannelOption(o => o.setName("channel").setDescription("Announcement channel (leave empty for current channel)").addChannelTypes(ChannelType.GuildText)))
    .addSubcommand(s => s.setName("add").setDescription("Add a level reward")
      .addIntegerOption(o => o.setName("level").setDescription("Level requirement").setRequired(true).setMinValue(1))
      .addRoleOption(o => o.setName("role").setDescription("Role to reward").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a level reward")
      .addIntegerOption(o => o.setName("level").setDescription("Level to remove reward from").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all level rewards and settings")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.levelRewards) cfg.levelRewards = [];
    if (!cfg.levelIgnore) cfg.levelIgnore = [];

    if (["enable", "disable", "ignore", "channel", "add", "remove"].includes(sub)) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });
    }

    if (sub === "enable") {
      cfg.levelEnabled = true;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, "Leveling system is now **enabled**.")] });
    }
    if (sub === "disable") {
      cfg.levelEnabled = false;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, "Leveling system is now **disabled**.")] });
    }
    if (sub === "ignore") {
      const target = interaction.options.getMentionable("target");
      const id = target.id;
      const idx = cfg.levelIgnore.indexOf(id);
      if (idx >= 0) {
        cfg.levelIgnore.splice(idx, 1);
        saveGuildConfig(interaction.guild.id, cfg);
        return interaction.reply({ embeds: [success(interaction, `Removed ${target} from the XP ignore list.`)] });
      }
      cfg.levelIgnore.push(id);
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Added ${target} to the XP ignore list.`)] });
    }
    if (sub === "channel") {
      const channel = interaction.options.getChannel("channel");
      cfg.levelChannel = channel?.id ?? null;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, channel ? `Level-up messages will be sent to ${channel}.` : "Level-up messages will be sent in the channel where the user chatted.")] });
    }
    if (sub === "add") {
      const level = interaction.options.getInteger("level");
      const role = interaction.options.getRole("role");
      const existing = cfg.levelRewards.findIndex(r => r.level === level);
      if (existing >= 0) cfg.levelRewards[existing] = { level, roleId: role.id };
      else cfg.levelRewards.push({ level, roleId: role.id });
      cfg.levelRewards.sort((a, b) => a.level - b.level);
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Added level reward: **Level ${level}** → **${role.name}**.`)] });
    }
    if (sub === "remove") {
      const level = interaction.options.getInteger("level");
      const idx = cfg.levelRewards.findIndex(r => r.level === level);
      if (idx < 0) return interaction.reply({ embeds: [error(interaction, `No reward found for level **${level}**.`)], ephemeral: true });
      cfg.levelRewards.splice(idx, 1);
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Removed reward for level **${level}**.`)] });
    }
    if (sub === "list") {
      const rewards = cfg.levelRewards ?? [];
      const ignored = cfg.levelIgnore ?? [];
      return interaction.reply({ embeds: [info(interaction, "Leveling Settings", null, [
        { name: "Enabled", value: cfg.levelEnabled ? "Yes" : "No", inline: true },
        { name: "Announce Channel", value: cfg.levelChannel ? `<#${cfg.levelChannel}>` : "Current channel", inline: true },
        { name: "Level Rewards", value: rewards.length ? rewards.map(r => `Level **${r.level}** → <@&${r.roleId}>`).join("\n") : "None", inline: false },
        { name: "Ignored", value: ignored.length ? ignored.map(id => `<#${id}> or <@&${id}>`).join(", ") : "None", inline: false },
      ])], ephemeral: true });
    }
  },
};
