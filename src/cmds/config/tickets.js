const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const { success, error, info, base, noPerms } = require("../../utils/embed");
const { getTickets, saveTickets } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Manage the ticket system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("setup").setDescription("Create a ticket panel in this channel")
      .addStringOption(o => o.setName("title").setDescription("Panel title").setRequired(true))
      .addStringOption(o => o.setName("description").setDescription("Panel description").setRequired(true))
      .addRoleOption(o => o.setName("support_role").setDescription("Support role that can see tickets")))
    .addSubcommand(s => s.setName("close").setDescription("Close a ticket"))
    .addSubcommand(s => s.setName("add").setDescription("Add a user to a ticket").addUserOption(o => o.setName("user").setDescription("User to add").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a user from a ticket").addUserOption(o => o.setName("user").setDescription("User to remove").setRequired(true)))
    .addSubcommand(s => s.setName("rename").setDescription("Rename the ticket channel").addStringOption(o => o.setName("name").setDescription("New name").setRequired(true)))
    .addSubcommand(s => s.setName("claim").setDescription("Claim this ticket"))
    .addSubcommand(s => s.setName("list").setDescription("List all open tickets")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const ticketData = getTickets(interaction.guild.id);

    if (sub === "setup") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");
      const supportRole = interaction.options.getRole("support_role");

      const panelId = `panel_${Date.now()}`;
      ticketData.panels = ticketData.panels ?? [];
      ticketData.panels.push({ panelId, title, description, channelId: interaction.channel.id, supportRoleId: supportRole?.id ?? null });
      saveTickets(interaction.guild.id, ticketData);

      const embed = base(interaction).setTitle(title).setDescription(description).setColor(0x2b2d31);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ticket_open_${panelId}`).setLabel("📩 Open Ticket").setStyle(ButtonStyle.Primary)
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ embeds: [success(interaction, "Ticket panel created!")], ephemeral: true });
      return;
    }

    const openTickets = ticketData.openTickets ?? {};
    const ticketEntry = Object.entries(openTickets).find(([, t]) => t.channelId === interaction.channel.id);

    if (!ticketEntry && ["close", "add", "remove", "rename", "claim"].includes(sub))
      return interaction.reply({ embeds: [error(interaction, "This is not a ticket channel.")], ephemeral: true });

    if (sub === "close") {
      const [ticketId, ticket] = ticketEntry;
      await interaction.reply({ embeds: [info(interaction, null, "Closing ticket in 5 seconds...")] });
      setTimeout(async () => {
        delete openTickets[ticketId];
        saveTickets(interaction.guild.id, ticketData);
        await interaction.channel.delete().catch(() => {});
      }, 5000);
    } else if (sub === "add") {
      const user = interaction.options.getUser("user");
      await interaction.channel.permissionOverwrites.edit(user, { ViewChannel: true, SendMessages: true });
      await interaction.reply({ embeds: [success(interaction, `Added **${user.username}** to the ticket.`)] });
    } else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      await interaction.channel.permissionOverwrites.delete(user);
      await interaction.reply({ embeds: [success(interaction, `Removed **${user.username}** from the ticket.`)] });
    } else if (sub === "rename") {
      const name = interaction.options.getString("name");
      await interaction.channel.setName(name);
      await interaction.reply({ embeds: [success(interaction, `Renamed ticket to **${name}**.`)] });
    } else if (sub === "claim") {
      const [, ticket] = ticketEntry;
      ticket.claimedBy = interaction.user.id;
      saveTickets(interaction.guild.id, ticketData);
      await interaction.reply({ embeds: [success(interaction, `**${interaction.user.username}** claimed this ticket.`)] });
    } else if (sub === "list") {
      const entries = Object.entries(openTickets);
      if (!entries.length) return interaction.reply({ embeds: [info(interaction, null, "No open tickets.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, `Open Tickets (${entries.length})`, entries.map(([id, t]) => `<#${t.channelId}> — opened by <@${t.openedBy}>`).join("\n"))], ephemeral: true });
    }
  },
};
