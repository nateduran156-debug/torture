const { SlashCommandBuilder } = require("discord.js");
const { base, success, error } = require("../../utils/embed");
const { getAfk, setAfk, removeAfk } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set your AFK status")
    .addStringOption(o => o.setName("reason").setDescription("Reason for going AFK").setRequired(false)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const existing = getAfk(userId);

    if (existing) {
      removeAfk(userId);
      return interaction.reply({
        embeds: [success(interaction, `Welcome back! I removed your AFK status.`)],
      });
    }

    const reason = interaction.options.getString("reason") ?? "AFK";
    setAfk(userId, {
      reason,
      time: Date.now(),
      username: interaction.user.username,
    });

    return interaction.reply({
      embeds: [
        base(interaction)
          .setDescription(`💤 You're now AFK: **${reason}**`)
          .setColor(0x5865f2),
      ],
    });
  },
};
