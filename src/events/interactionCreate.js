const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { error, success, base } = require("../utils/embed");
const { getGiveaways, saveGiveaways, getButtonRoles, getTickets, saveTickets } = require("../utils/database");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

    // ── Slash commands ───────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[error] /${interaction.commandName}:`, err);
        const reply = { embeds: [error(interaction, "An error occurred while running that command.")], ephemeral: true };
        if (interaction.deferred || interaction.replied) await interaction.editReply(reply).catch(() => {});
        else await interaction.reply(reply).catch(() => {});
      }
      return;
    }

    // ── Select menus (Help navigation) ──────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      const { customId } = interaction;

      if (customId.startsWith("help_main_") || customId.startsWith("help_extra_")) {
        const parts  = customId.split("_");
        const userId = parts[2];

        if (interaction.user.id !== userId) {
          return interaction.reply({ content: "This menu isn't for you.", ephemeral: true });
        }

        const helpCmd = interaction.client.commands.get("help");
        if (!helpCmd) return;

        const chosen = interaction.values[0];

        if (chosen === "home") {
          return interaction.update({
            flags:      MessageFlags.IsComponentsV2,
            components: [helpCmd.buildHomeContainer(interaction.client, userId)],
          });
        }

        const container = helpCmd.buildCategoryContainer(chosen, userId);
        if (!container) return interaction.reply({ content: "Category not found.", ephemeral: true });

        return interaction.update({
          flags:      MessageFlags.IsComponentsV2,
          components: [container],
        });
      }
    }

    // ── Button interactions ──────────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId } = interaction;

      // ── Giveaway entry ─────────────────────────────────────────────────
      if (customId === "giveaway_enter") {
        const giveaways = getGiveaways();
        const gw = giveaways[interaction.message.id];
        if (!gw || gw.ended) return interaction.reply({ content: "This giveaway has ended.", ephemeral: true });

        if (gw.entries.includes(interaction.user.id)) {
          gw.entries = gw.entries.filter(id => id !== interaction.user.id);
          saveGiveaways(giveaways);
          return interaction.reply({ content: "❌ You left the giveaway.", ephemeral: true });
        }
        gw.entries.push(interaction.user.id);
        saveGiveaways(giveaways);
        return interaction.reply({ content: `🎉 You entered the giveaway! (**${gw.entries.length}** entries total)`, ephemeral: true });
      }

      // ── Button roles ───────────────────────────────────────────────────
      if (customId.startsWith("buttonrole_")) {
        const [, msgId, idxStr] = customId.split("_");
        const br      = getButtonRoles(interaction.guild?.id);
        const buttons = br[msgId];
        if (!buttons) return interaction.reply({ content: "Button role data not found.", ephemeral: true });

        const btn = buttons[parseInt(idxStr)];
        if (!btn) return interaction.reply({ content: "Button role not found.", ephemeral: true });

        const member = interaction.member;
        if (member.roles.cache.has(btn.roleId)) {
          await member.roles.remove(btn.roleId).catch(() => {});
          return interaction.reply({ content: `Removed role <@&${btn.roleId}>.`, ephemeral: true });
        }
        await member.roles.add(btn.roleId).catch(() => {});
        return interaction.reply({ content: `Added role <@&${btn.roleId}>.`, ephemeral: true });
      }

      // ── Ticket open ────────────────────────────────────────────────────
      if (customId.startsWith("ticket_open_")) {
        const panelId    = customId.replace("ticket_open_", "");
        const ticketData = getTickets(interaction.guild.id);
        const panel      = ticketData.panels?.find(p => p.panelId === panelId);
        if (!panel) return interaction.reply({ content: "Ticket panel not found.", ephemeral: true });

        ticketData.openTickets = ticketData.openTickets ?? {};

        const existing = Object.values(ticketData.openTickets).find(
          t => t.openedBy === interaction.user.id && t.panelId === panelId
        );
        if (existing) {
          const ch = interaction.guild.channels.cache.get(existing.channelId);
          if (ch) return interaction.reply({ content: `You already have an open ticket: ${ch}`, ephemeral: true });
        }

        try {
          const overwrites = [
            { id: interaction.guild.roles.everyone,  deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: interaction.guild.members.me, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
          ];
          if (panel.supportRoleId) {
            overwrites.push({ id: panel.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
          }

          const ticketCh = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ""),
            type: ChannelType.GuildText,
            permissionOverwrites: overwrites,
            reason: `Ticket opened by ${interaction.user.tag}`,
          });

          const ticketId = `ticket_${Date.now()}`;
          ticketData.openTickets[ticketId] = { channelId: ticketCh.id, openedBy: interaction.user.id, panelId, claimedBy: null };
          saveTickets(interaction.guild.id, ticketData);

          const embed = base(interaction)
            .setTitle("Ticket Opened")
            .setDescription(`Welcome ${interaction.user}! A staff member will assist you shortly.\n\nUse \`/tickets close\` to close this ticket.`)
            .setColor(0x2b2d31);

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ticket_close_btn").setLabel("🔒 Close Ticket").setStyle(ButtonStyle.Danger)
          );

          await ticketCh.send({ embeds: [embed], components: [row] });
          return interaction.reply({ content: `Your ticket has been created: ${ticketCh}`, ephemeral: true });
        } catch {
          return interaction.reply({ content: "Failed to create ticket channel.", ephemeral: true });
        }
      }

      // ── Ticket close via button ────────────────────────────────────────
      if (customId === "ticket_close_btn") {
        const ticketData  = getTickets(interaction.guild.id);
        const ticketEntry = Object.entries(ticketData.openTickets ?? {}).find(([, t]) => t.channelId === interaction.channel.id);
        if (!ticketEntry) return interaction.reply({ content: "This is not a ticket channel.", ephemeral: true });
        await interaction.reply({ content: "Closing ticket in 5 seconds..." });
        setTimeout(async () => {
          const [ticketId] = ticketEntry;
          delete ticketData.openTickets[ticketId];
          saveTickets(interaction.guild.id, ticketData);
          await interaction.channel.delete().catch(() => {});
        }, 5000);
      }
    }
  },
};
