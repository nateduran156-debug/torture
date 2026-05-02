const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { base, success, error } = require("../../utils/embed");
const { getCounting, saveCounting } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counting")
    .setDescription("Manage the counting channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(s =>
      s.setName("setup")
        .setDescription("Set the counting channel")
        .addChannelOption(o => o.setName("channel").setDescription("Channel to use for counting").setRequired(true))
    )
    .addSubcommand(s => s.setName("disable").setDescription("Disable the counting channel"))
    .addSubcommand(s => s.setName("status").setDescription("Show counting channel info"))
    .addSubcommand(s => s.setName("reset").setDescription("Reset the count back to 0")),

  async execute(interaction) {
    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const data    = getCounting(guildId);

    if (sub === "setup") {
      const channel        = interaction.options.getChannel("channel");
      data.channelId       = channel.id;
      data.count           = 0;
      data.lastUserId      = null;
      data.failed          = false;
      saveCounting(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `Counting channel set to ${channel}. Start counting from **1**!`)] });
    }

    if (sub === "disable") {
      data.channelId = null;
      saveCounting(guildId, data);
      return interaction.reply({ embeds: [success(interaction, "Counting channel has been disabled.")] });
    }

    if (sub === "status") {
      if (!data.channelId) return interaction.reply({ embeds: [error(interaction, "No counting channel is set up.")], ephemeral: true });
      return interaction.reply({
        embeds: [
          base(interaction)
            .setTitle("🔢 Counting Status")
            .addFields(
              { name: "Channel", value: `<#${data.channelId}>`,       inline: true },
              { name: "Count",   value: `**${data.count}**`,           inline: true },
              { name: "Status",  value: data.failed ? "❌ Failed" : "✅ Active", inline: true },
            )
            .setColor(0x2b2d31),
        ],
      });
    }

    if (sub === "reset") {
      data.count      = 0;
      data.lastUserId = null;
      data.failed     = false;
      saveCounting(guildId, data);
      if (data.channelId) {
        const ch = interaction.guild.channels.cache.get(data.channelId);
        if (ch) await ch.send("🔄 The count has been reset. Start from **1**!").catch(() => {});
      }
      return interaction.reply({ embeds: [success(interaction, "Count has been reset to 0.")] });
    }
  },
};
