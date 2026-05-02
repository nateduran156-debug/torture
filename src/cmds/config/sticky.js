const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { base, success, error } = require("../../utils/embed");
const { getSticky, saveSticky } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sticky")
    .setDescription("Manage sticky messages for a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(s =>
      s.setName("setup")
        .setDescription("Set a sticky message for a channel")
        .addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true))
        .addStringOption(o => o.setName("message").setDescription("Message to stick").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("remove")
        .setDescription("Remove a sticky message from a channel")
        .addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true))
    )
    .addSubcommand(s => s.setName("list").setDescription("List all sticky messages in this server")),

  async execute(interaction) {
    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const sticky  = getSticky(guildId);

    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");
      const message = interaction.options.getString("message");

      if (sticky[channel.id]?.lastMessageId) {
        const old = await channel.messages.fetch(sticky[channel.id].lastMessageId).catch(() => null);
        if (old) await old.delete().catch(() => {});
      }

      const sent = await channel.send(`📌 **Sticky:** ${message}`).catch(() => null);
      if (!sent) return interaction.reply({ embeds: [error(interaction, "Could not send message to that channel.")], ephemeral: true });

      sticky[channel.id] = { content: message, lastMessageId: sent.id };
      saveSticky(guildId, sticky);

      return interaction.reply({ embeds: [success(interaction, `Sticky message set in ${channel}.`)] });
    }

    if (sub === "remove") {
      const channel = interaction.options.getChannel("channel");

      if (!sticky[channel.id]) return interaction.reply({ embeds: [error(interaction, "No sticky message in that channel.")], ephemeral: true });

      const old = await channel.messages.fetch(sticky[channel.id].lastMessageId).catch(() => null);
      if (old) await old.delete().catch(() => {});

      delete sticky[channel.id];
      saveSticky(guildId, sticky);

      return interaction.reply({ embeds: [success(interaction, `Removed sticky message from ${channel}.`)] });
    }

    if (sub === "list") {
      const entries = Object.entries(sticky);
      if (!entries.length) return interaction.reply({ embeds: [error(interaction, "No sticky messages in this server.")], ephemeral: true });

      const lines = entries.map(([cId, data]) => `<#${cId}> — ${data.content.slice(0, 60)}${data.content.length > 60 ? "..." : ""}`);
      return interaction.reply({
        embeds: [
          base(interaction)
            .setTitle(`📌 Sticky Messages [${lines.length}]`)
            .setDescription(lines.join("\n"))
            .setColor(0x2b2d31),
        ],
      });
    }
  },
};
