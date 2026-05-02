const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getButtonRoles, saveButtonRoles } = require("../../utils/database");

const STYLES = { green: ButtonStyle.Success, blurple: ButtonStyle.Primary, gray: ButtonStyle.Secondary, red: ButtonStyle.Danger };

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buttonrole")
    .setDescription("Manage button roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(s => s.setName("add").setDescription("Add a button role to a message")
      .addStringOption(o => o.setName("message_id").setDescription("Message ID").setRequired(true))
      .addRoleOption(o => o.setName("role").setDescription("Role to assign").setRequired(true))
      .addStringOption(o => o.setName("style").setDescription("Button style").setRequired(true).addChoices(
        { name: "Green", value: "green" }, { name: "Blurple", value: "blurple" }, { name: "Gray", value: "gray" }, { name: "Red", value: "red" }
      ))
      .addStringOption(o => o.setName("label").setDescription("Button label").setRequired(true))
      .addStringOption(o => o.setName("emoji").setDescription("Button emoji")))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a button role").addStringOption(o => o.setName("message_id").setDescription("Message ID").setRequired(true)).addIntegerOption(o => o.setName("number").setDescription("Button number").setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName("list").setDescription("List all button roles")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Roles")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const br = getButtonRoles(interaction.guild.id);

    if (sub === "add") {
      const msgId = interaction.options.getString("message_id");
      const role = interaction.options.getRole("role");
      const style = interaction.options.getString("style");
      const label = interaction.options.getString("label");
      const emoji = interaction.options.getString("emoji");

      if (role.position >= interaction.guild.members.me.roles.highest.position)
        return interaction.reply({ embeds: [error(interaction, "That role is above my highest role.")], ephemeral: true });

      try {
        const msg = await interaction.channel.messages.fetch(msgId);
        if (!br[msgId]) br[msgId] = [];
        if (br[msgId].length >= 5) return interaction.reply({ embeds: [error(interaction, "Maximum 5 buttons per message.")], ephemeral: true });

        const idx = br[msgId].length;
        br[msgId].push({ roleId: role.id, style, label, emoji: emoji ?? null });
        saveButtonRoles(interaction.guild.id, br);

        const row = new ActionRowBuilder().addComponents(
          br[msgId].map((b, i) => {
            const btn = new ButtonBuilder().setCustomId(`buttonrole_${msgId}_${i}`).setLabel(b.label).setStyle(STYLES[b.style] ?? ButtonStyle.Primary);
            if (b.emoji) btn.setEmoji(b.emoji);
            return btn;
          })
        );

        await msg.edit({ components: [row] });
        await interaction.reply({ embeds: [success(interaction, `Added button role **${role.name}** to message \`${msgId}\`.`)] });
      } catch {
        await interaction.reply({ embeds: [error(interaction, "Could not find or edit that message.")], ephemeral: true });
      }

    } else if (sub === "remove") {
      const msgId = interaction.options.getString("message_id");
      const num = interaction.options.getInteger("number") - 1;
      if (!br[msgId] || num < 0 || num >= br[msgId].length) return interaction.reply({ embeds: [error(interaction, "Invalid button number.")], ephemeral: true });
      br[msgId].splice(num, 1);
      if (!br[msgId].length) delete br[msgId];
      saveButtonRoles(interaction.guild.id, br);
      await interaction.reply({ embeds: [success(interaction, `Removed button #${num + 1} from message \`${msgId}\`.`)] });

    } else if (sub === "list") {
      const entries = Object.entries(br);
      if (!entries.length) return interaction.reply({ embeds: [info(interaction, null, "No button roles configured.")], ephemeral: true });
      const embed = info(interaction, "Button Roles");
      for (const [msgId, buttons] of entries) {
        embed.addFields({ name: `Message ${msgId}`, value: buttons.map((b, i) => `**${i + 1}.** ${b.emoji ?? ""} ${b.label} → <@&${b.roleId}>`).join("\n") });
      }
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
