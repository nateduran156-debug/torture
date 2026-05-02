const { SlashCommandBuilder } = require("discord.js");
const { success, error, info } = require("../../utils/embed");
const { getReminders, saveReminders } = require("../../utils/database");
const { parseDuration, formatDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Manage reminders")
    .addSubcommand(s => s.setName("set").setDescription("Set a reminder")
      .addStringOption(o => o.setName("duration").setDescription("When to remind you (e.g. 1h, 30m)").setRequired(true))
      .addStringOption(o => o.setName("message").setDescription("What to remind you about").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("View your reminders"))
    .addSubcommand(s => s.setName("delete").setDescription("Delete a reminder").addIntegerOption(o => o.setName("index").setDescription("Reminder number").setRequired(true).setMinValue(1))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const reminders = getReminders(interaction.user.id);

    if (sub === "set") {
      const durationStr = interaction.options.getString("duration");
      const message = interaction.options.getString("message");
      const ms = parseDuration(durationStr);
      if (!ms) return interaction.reply({ embeds: [error(interaction, "Invalid duration.")], ephemeral: true });

      const fireAt = Date.now() + ms;
      reminders.push({ message, fireAt, channelId: interaction.channel.id, guildId: interaction.guild?.id });
      saveReminders(interaction.user.id, reminders);

      setTimeout(async () => {
        try {
          const channel = await interaction.client.channels.fetch(interaction.channel.id);
          await channel.send({ content: `<@${interaction.user.id}>`, embeds: [info(interaction, "⏰ Reminder", message)] });
        } catch {
          await interaction.user.send({ embeds: [info(interaction, "⏰ Reminder", message)] }).catch(() => {});
        }
        const updated = getReminders(interaction.user.id).filter(r => r.fireAt !== fireAt);
        saveReminders(interaction.user.id, updated);
      }, ms);

      await interaction.reply({ embeds: [success(interaction, `Reminder set for **${formatDuration(ms)}** from now.\n**Message:** ${message}`)] });

    } else if (sub === "list") {
      if (!reminders.length) return interaction.reply({ embeds: [info(interaction, null, "You have no active reminders.")], ephemeral: true });
      const embed = info(interaction, "Your Reminders");
      reminders.forEach((r, i) => embed.addFields({ name: `#${i + 1}`, value: `${r.message}\nFires <t:${Math.floor(r.fireAt / 1000)}:R>` }));
      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else if (sub === "delete") {
      const idx = interaction.options.getInteger("index") - 1;
      if (idx < 0 || idx >= reminders.length) return interaction.reply({ embeds: [error(interaction, "Invalid reminder number.")], ephemeral: true });
      reminders.splice(idx, 1);
      saveReminders(interaction.user.id, reminders);
      await interaction.reply({ embeds: [success(interaction, `Deleted reminder #${idx + 1}.`)], ephemeral: true });
    }
  },
};
