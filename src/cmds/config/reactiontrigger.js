const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getReactionTriggers, saveReactionTriggers } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactiontrigger")
    .setDescription("Manage reaction triggers (auto-react to messages)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Add a reaction trigger")
      .addStringOption(o => o.setName("trigger").setDescription("Trigger phrase").setRequired(true))
      .addStringOption(o => o.setName("emoji").setDescription("Emoji to react with").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a reaction trigger").addStringOption(o => o.setName("trigger").setDescription("Trigger to remove").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all reaction triggers")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const triggers = getReactionTriggers(interaction.guild.id);

    if (sub === "add") {
      const trigger = interaction.options.getString("trigger").toLowerCase();
      const emoji = interaction.options.getString("emoji");
      if (triggers.length >= 20) return interaction.reply({ embeds: [error(interaction, "Maximum 20 reaction triggers.")], ephemeral: true });
      if (triggers.find(t => t.trigger === trigger && t.emoji === emoji)) return interaction.reply({ embeds: [error(interaction, "That trigger+emoji already exists.")], ephemeral: true });
      triggers.push({ trigger, emoji });
      saveReactionTriggers(interaction.guild.id, triggers);
      return interaction.reply({ embeds: [success(interaction, `React with ${emoji} when messages contain \`${trigger}\`.`)] });
    }
    if (sub === "remove") {
      const trigger = interaction.options.getString("trigger").toLowerCase();
      const idx = triggers.findIndex(t => t.trigger === trigger);
      if (idx < 0) return interaction.reply({ embeds: [error(interaction, "Trigger not found.")], ephemeral: true });
      triggers.splice(idx, 1);
      saveReactionTriggers(interaction.guild.id, triggers);
      return interaction.reply({ embeds: [success(interaction, `Removed reaction trigger for \`${trigger}\`.`)] });
    }
    if (sub === "list") {
      if (!triggers.length) return interaction.reply({ embeds: [info(interaction, null, "No reaction triggers configured.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, `Reaction Triggers (${triggers.length})`, triggers.map(t => `\`${t.trigger}\` → ${t.emoji}`).join("\n"))], ephemeral: true });
    }
  },
};
