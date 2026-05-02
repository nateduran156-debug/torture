const { SlashCommandBuilder } = require("discord.js");
const { success, error, info } = require("../../utils/embed");
const { getTodos, saveTodos } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todo")
    .setDescription("Manage your to-do list")
    .addSubcommand(s => s.setName("add").setDescription("Add a task").addStringOption(o => o.setName("task").setDescription("The task").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("View your to-do list"))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a task").addIntegerOption(o => o.setName("index").setDescription("Task number").setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName("clear").setDescription("Clear your entire to-do list")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const todos = getTodos(interaction.user.id);

    if (sub === "add") {
      const task = interaction.options.getString("task");
      if (todos.length >= 20) return interaction.reply({ embeds: [error(interaction, "You can only have up to 20 tasks.")], ephemeral: true });
      todos.push({ task, done: false, created: Date.now() });
      saveTodos(interaction.user.id, todos);
      await interaction.reply({ embeds: [success(interaction, `Added task #${todos.length}: **${task}**`)], ephemeral: true });

    } else if (sub === "list") {
      if (!todos.length) return interaction.reply({ embeds: [info(interaction, null, "Your to-do list is empty.")], ephemeral: true });
      const embed = info(interaction, `${interaction.user.username}'s To-Do List`, todos.map((t, i) => `**${i + 1}.** ${t.task}`).join("\n"));
      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else if (sub === "remove") {
      const idx = interaction.options.getInteger("index") - 1;
      if (idx < 0 || idx >= todos.length) return interaction.reply({ embeds: [error(interaction, "Invalid task number.")], ephemeral: true });
      const removed = todos.splice(idx, 1)[0];
      saveTodos(interaction.user.id, todos);
      await interaction.reply({ embeds: [success(interaction, `Removed task: **${removed.task}**`)], ephemeral: true });

    } else if (sub === "clear") {
      saveTodos(interaction.user.id, []);
      await interaction.reply({ embeds: [success(interaction, "Cleared your to-do list.")], ephemeral: true });
    }
  },
};
