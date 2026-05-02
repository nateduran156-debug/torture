const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getAutoresponders, saveAutoresponders } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoresponder")
    .setDescription("Manage auto responders")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Add an auto responder")
      .addStringOption(o => o.setName("trigger").setDescription("Trigger phrase").setRequired(true))
      .addStringOption(o => o.setName("response").setDescription("Response message").setRequired(true))
      .addBooleanOption(o => o.setName("wildcard").setDescription("Match anywhere in message (not just exact)"))
      .addIntegerOption(o => o.setName("self_destruct").setDescription("Delete response after N seconds (6-60)").setMinValue(6).setMaxValue(60)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove an auto responder").addStringOption(o => o.setName("trigger").setDescription("Trigger to remove").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all auto responders"))
    .addSubcommand(s => s.setName("view").setDescription("View a specific auto responder").addStringOption(o => o.setName("trigger").setDescription("Trigger to view").setRequired(true))),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const ars = getAutoresponders(interaction.guild.id);

    if (sub === "add") {
      const trigger = interaction.options.getString("trigger").toLowerCase();
      const response = interaction.options.getString("response");
      const wildcard = interaction.options.getBoolean("wildcard") ?? false;
      const selfDestruct = interaction.options.getInteger("self_destruct") ?? null;
      if (ars.length >= 30) return interaction.reply({ embeds: [error(interaction, "Maximum 30 auto responders per server.")], ephemeral: true });
      if (ars.find(a => a.trigger === trigger)) return interaction.reply({ embeds: [error(interaction, `An auto responder for \`${trigger}\` already exists.`)], ephemeral: true });
      ars.push({ trigger, response, wildcard, selfDestruct });
      saveAutoresponders(interaction.guild.id, ars);
      return interaction.reply({ embeds: [success(interaction, `Added auto responder for trigger: \`${trigger}\`.`)] });
    }
    if (sub === "remove") {
      const trigger = interaction.options.getString("trigger").toLowerCase();
      const idx = ars.findIndex(a => a.trigger === trigger);
      if (idx < 0) return interaction.reply({ embeds: [error(interaction, `No auto responder found for \`${trigger}\`.`)], ephemeral: true });
      ars.splice(idx, 1);
      saveAutoresponders(interaction.guild.id, ars);
      return interaction.reply({ embeds: [success(interaction, `Removed auto responder for \`${trigger}\`.`)] });
    }
    if (sub === "list") {
      if (!ars.length) return interaction.reply({ embeds: [info(interaction, null, "No auto responders configured.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, `Auto Responders (${ars.length})`, ars.map(a => `\`${a.trigger}\``).join(", "))], ephemeral: true });
    }
    if (sub === "view") {
      const trigger = interaction.options.getString("trigger").toLowerCase();
      const ar = ars.find(a => a.trigger === trigger);
      if (!ar) return interaction.reply({ embeds: [error(interaction, `No auto responder for \`${trigger}\`.`)], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, `Auto Responder: ${trigger}`, null, [
        { name: "Trigger", value: ar.trigger, inline: true },
        { name: "Wildcard", value: ar.wildcard ? "Yes" : "No", inline: true },
        { name: "Self Destruct", value: ar.selfDestruct ? `${ar.selfDestruct}s` : "No", inline: true },
        { name: "Response", value: ar.response.slice(0, 1024) },
      ])], ephemeral: true });
    }
  },
};
