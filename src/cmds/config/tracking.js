const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { base, success, error } = require("../../utils/embed");
const { getTracking, saveTracking } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tracking")
    .setDescription("Track member message activity")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("enable").setDescription("Enable message tracking"))
    .addSubcommand(s => s.setName("disable").setDescription("Disable message tracking"))
    .addSubcommand(s => s.setName("status").setDescription("Show tracking status"))
    .addSubcommand(s =>
      s.setName("messages")
        .setDescription("Show message count for a user")
        .addUserOption(o => o.setName("user").setDescription("User to check").setRequired(true))
    )
    .addSubcommand(s => s.setName("leaderboard").setDescription("Show the message leaderboard"))
    .addSubcommand(s =>
      s.setName("reset")
        .setDescription("Reset a user's message count")
        .addUserOption(o => o.setName("user").setDescription("User to reset").setRequired(true))
    )
    .addSubcommand(s => s.setName("resetall").setDescription("Reset ALL tracking data for this server")),

  async execute(interaction) {
    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const data    = getTracking(guildId);

    if (sub === "enable") {
      data.enabled = true;
      saveTracking(guildId, data);
      return interaction.reply({ embeds: [success(interaction, "Message tracking is now **enabled**.")] });
    }

    if (sub === "disable") {
      data.enabled = false;
      saveTracking(guildId, data);
      return interaction.reply({ embeds: [success(interaction, "Message tracking is now **disabled**.")] });
    }

    if (sub === "status") {
      const total = Object.values(data.users ?? {}).reduce((a, u) => a + (u.messages ?? 0), 0);
      return interaction.reply({
        embeds: [
          base(interaction)
            .setTitle("📈 Tracking Status")
            .addFields(
              { name: "Status",          value: data.enabled ? "✅ Enabled" : "❌ Disabled", inline: true },
              { name: "Tracked Members", value: `${Object.keys(data.users ?? {}).length}`,   inline: true },
              { name: "Total Messages",  value: `${total.toLocaleString()}`,                  inline: true },
            )
            .setColor(0x2b2d31),
        ],
      });
    }

    if (sub === "messages") {
      const user  = interaction.options.getUser("user");
      const entry = data.users?.[user.id];
      const count = entry?.messages ?? 0;
      return interaction.reply({
        embeds: [
          base(interaction)
            .setTitle("📊 Message Count")
            .setDescription(`${user} has sent **${count.toLocaleString()}** tracked messages.`)
            .setColor(0x2b2d31),
        ],
      });
    }

    if (sub === "leaderboard") {
      const sorted = Object.entries(data.users ?? {})
        .sort((a, b) => (b[1].messages ?? 0) - (a[1].messages ?? 0))
        .slice(0, 10);

      if (!sorted.length) return interaction.reply({ embeds: [error(interaction, "No tracking data yet.")], ephemeral: true });

      const lines = sorted.map(([id, u], i) => `\`${String(i + 1).padStart(2, "0")}.\` <@${id}> — **${(u.messages ?? 0).toLocaleString()}** messages`);
      return interaction.reply({
        embeds: [
          base(interaction)
            .setTitle("📈 Message Leaderboard")
            .setDescription(lines.join("\n"))
            .setColor(0x2b2d31),
        ],
      });
    }

    if (sub === "reset") {
      const user = interaction.options.getUser("user");
      if (data.users?.[user.id]) {
        data.users[user.id].messages = 0;
        saveTracking(guildId, data);
      }
      return interaction.reply({ embeds: [success(interaction, `Reset message count for ${user.tag}.`)] });
    }

    if (sub === "resetall") {
      data.users = {};
      saveTracking(guildId, data);
      return interaction.reply({ embeds: [success(interaction, "All tracking data has been reset.")] });
    }
  },
};
