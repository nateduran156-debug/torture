const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("webhook")
    .setDescription("Manage webhooks")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
    .addSubcommand(s => s.setName("create").setDescription("Create a webhook")
      .addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true).addChannelTypes(ChannelType.GuildText))
      .addStringOption(o => o.setName("name").setDescription("Webhook name").setRequired(true))
      .addStringOption(o => o.setName("avatar").setDescription("Avatar image URL")))
    .addSubcommand(s => s.setName("send").setDescription("Send a message through a webhook")
      .addStringOption(o => o.setName("url").setDescription("Webhook URL").setRequired(true))
      .addStringOption(o => o.setName("message").setDescription("Message to send").setRequired(true))
      .addStringOption(o => o.setName("username").setDescription("Override username"))
      .addStringOption(o => o.setName("avatar").setDescription("Override avatar URL")))
    .addSubcommand(s => s.setName("delete").setDescription("Delete a webhook by URL").addStringOption(o => o.setName("url").setDescription("Webhook URL").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List webhooks in a channel").addChannelOption(o => o.setName("channel").setDescription("Channel (defaults to current)"))),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageWebhooks))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Webhooks")], ephemeral: true });

    const sub = interaction.options.getSubcommand();

    if (sub === "create") {
      const channel = interaction.options.getChannel("channel");
      const name = interaction.options.getString("name");
      const avatar = interaction.options.getString("avatar");
      try {
        const wh = await channel.createWebhook({ name, avatar: avatar ?? null, reason: `Created by ${interaction.user.tag}` });
        return interaction.reply({ embeds: [success(interaction, `Created webhook **${wh.name}** in ${channel}.\n**URL:** \`${wh.url}\``)], ephemeral: true });
      } catch { return interaction.reply({ embeds: [error(interaction, "Failed to create webhook.")], ephemeral: true }); }
    }

    if (sub === "send") {
      const url = interaction.options.getString("url");
      const message = interaction.options.getString("message");
      const username = interaction.options.getString("username");
      const avatar = interaction.options.getString("avatar");
      try {
        await axios.post(url, { content: message, username: username ?? undefined, avatar_url: avatar ?? undefined });
        return interaction.reply({ embeds: [success(interaction, "Message sent through webhook.")], ephemeral: true });
      } catch { return interaction.reply({ embeds: [error(interaction, "Failed to send message. Is the webhook URL valid?")], ephemeral: true }); }
    }

    if (sub === "delete") {
      const url = interaction.options.getString("url");
      try {
        await axios.delete(url);
        return interaction.reply({ embeds: [success(interaction, "Webhook deleted.")], ephemeral: true });
      } catch { return interaction.reply({ embeds: [error(interaction, "Failed to delete webhook.")], ephemeral: true }); }
    }

    if (sub === "list") {
      const channel = interaction.options.getChannel("channel") ?? interaction.channel;
      try {
        const webhooks = await channel.fetchWebhooks();
        if (!webhooks.size) return interaction.reply({ embeds: [info(interaction, null, "No webhooks in that channel.")], ephemeral: true });
        return interaction.reply({ embeds: [info(interaction, `Webhooks in #${channel.name}`, webhooks.map(w => `**${w.name}** — \`${w.id}\``).join("\n"))], ephemeral: true });
      } catch { return interaction.reply({ embeds: [error(interaction, "Failed to fetch webhooks.")], ephemeral: true }); }
    }
  },
};
