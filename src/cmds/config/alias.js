const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("alias")
    .setDescription("Manage command aliases")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Create a command alias")
      .addStringOption(o => o.setName("alias").setDescription("The alias name").setRequired(true))
      .addStringOption(o => o.setName("command").setDescription("Command it maps to").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a command alias").addStringOption(o => o.setName("alias").setDescription("Alias to remove").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all aliases")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg.aliases) cfg.aliases = {};

    if (sub === "add") {
      const alias = interaction.options.getString("alias").toLowerCase();
      const command = interaction.options.getString("command").toLowerCase();
      if (!interaction.client.commands.has(command)) return interaction.reply({ embeds: [error(interaction, `No command found named \`${command}\`.`)], ephemeral: true });
      cfg.aliases[alias] = command;
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Alias \`${alias}\` → \`${command}\` created.`)] });
    }
    if (sub === "remove") {
      const alias = interaction.options.getString("alias").toLowerCase();
      if (!cfg.aliases[alias]) return interaction.reply({ embeds: [error(interaction, `No alias \`${alias}\` found.`)], ephemeral: true });
      delete cfg.aliases[alias];
      saveGuildConfig(interaction.guild.id, cfg);
      return interaction.reply({ embeds: [success(interaction, `Removed alias \`${alias}\`.`)] });
    }
    if (sub === "list") {
      const entries = Object.entries(cfg.aliases ?? {});
      if (!entries.length) return interaction.reply({ embeds: [info(interaction, null, "No aliases configured.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, "Command Aliases", entries.map(([a, c]) => `\`${a}\` → \`${c}\``).join("\n"))], ephemeral: true });
    }
  },
};
