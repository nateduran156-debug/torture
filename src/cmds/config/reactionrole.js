const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getReactionRoles, saveReactionRoles } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Manage reaction roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(s => s.setName("add").setDescription("Add a reaction role to a message")
      .addStringOption(o => o.setName("message_id").setDescription("Message ID").setRequired(true))
      .addStringOption(o => o.setName("emoji").setDescription("Emoji to react with").setRequired(true))
      .addRoleOption(o => o.setName("role").setDescription("Role to assign").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a reaction role")
      .addStringOption(o => o.setName("message_id").setDescription("Message ID").setRequired(true))
      .addStringOption(o => o.setName("emoji").setDescription("Emoji").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all reaction roles"))
    .addSubcommand(s => s.setName("removeall").setDescription("Remove all reaction roles from a message")
      .addStringOption(o => o.setName("message_id").setDescription("Message ID").setRequired(true))),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Roles")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const rr = getReactionRoles(interaction.guild.id);

    if (sub === "add") {
      const msgId = interaction.options.getString("message_id");
      const emoji = interaction.options.getString("emoji");
      const role = interaction.options.getRole("role");

      if (role.position >= interaction.guild.members.me.roles.highest.position)
        return interaction.reply({ embeds: [error(interaction, "That role is above my highest role.")], ephemeral: true });

      try {
        const msg = await interaction.channel.messages.fetch(msgId);
        await msg.react(emoji);
        if (!rr[msgId]) rr[msgId] = {};
        rr[msgId][emoji] = role.id;
        saveReactionRoles(interaction.guild.id, rr);
        await interaction.reply({ embeds: [success(interaction, `Added reaction role: ${emoji} → **${role.name}** on message \`${msgId}\`.`)] });
      } catch {
        await interaction.reply({ embeds: [error(interaction, "Could not find that message or react to it.")], ephemeral: true });
      }

    } else if (sub === "remove") {
      const msgId = interaction.options.getString("message_id");
      const emoji = interaction.options.getString("emoji");
      if (!rr[msgId]?.[emoji]) return interaction.reply({ embeds: [error(interaction, "No reaction role found.")], ephemeral: true });
      delete rr[msgId][emoji];
      if (!Object.keys(rr[msgId]).length) delete rr[msgId];
      saveReactionRoles(interaction.guild.id, rr);
      await interaction.reply({ embeds: [success(interaction, `Removed reaction role ${emoji} from message \`${msgId}\`.`)] });

    } else if (sub === "removeall") {
      const msgId = interaction.options.getString("message_id");
      delete rr[msgId];
      saveReactionRoles(interaction.guild.id, rr);
      await interaction.reply({ embeds: [success(interaction, `Removed all reaction roles from message \`${msgId}\`.`)] });

    } else if (sub === "list") {
      const entries = Object.entries(rr);
      if (!entries.length) return interaction.reply({ embeds: [info(interaction, null, "No reaction roles configured.")], ephemeral: true });
      const embed = info(interaction, "Reaction Roles");
      for (const [msgId, emojis] of entries) {
        embed.addFields({ name: `Message ${msgId}`, value: Object.entries(emojis).map(([e, rid]) => `${e} → <@&${rid}>`).join("\n") });
      }
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
