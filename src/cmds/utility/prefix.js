const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prefix")
    .setDescription("View or change the bot prefix")
    .addSubcommand(s => s.setName("set").setDescription("Change the bot prefix")
      .addStringOption(o => o.setName("prefix").setDescription("New prefix (max 5 chars)").setRequired(true)))
    .addSubcommand(s => s.setName("view").setDescription("View the current prefix")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cfg = getGuildConfig(interaction.guild.id);

    if (sub === "view") {
      return interaction.reply({ embeds: [info(interaction, null, `The current prefix is \`${cfg.prefix ?? ","}\`.`)] });
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const prefix = interaction.options.getString("prefix");
    if (prefix.length > 5) return interaction.reply({ embeds: [error(interaction, "Prefix must be 5 characters or less.")], ephemeral: true });
    cfg.prefix = prefix;
    saveGuildConfig(interaction.guild.id, cfg);
    return interaction.reply({ embeds: [success(interaction, `Prefix changed to \`${prefix}\`.`)] });
  },
};
