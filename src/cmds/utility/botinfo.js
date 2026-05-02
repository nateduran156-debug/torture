const { SlashCommandBuilder, version: djsVersion } = require("discord.js");
const { base, LOGO } = require("../../utils/embed");
const { formatDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Display information about the bot"),

  async execute(interaction) {
    const client = interaction.client;
    const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = base(interaction)
      .setTitle(client.user.username)
      .setThumbnail(LOGO)
      .addFields(
        { name: "Guilds", value: `${client.guilds.cache.size}`, inline: true },
        { name: "Users", value: `${client.users.cache.size}`, inline: true },
        { name: "Channels", value: `${client.channels.cache.size}`, inline: true },
        { name: "Uptime", value: formatDuration(client.uptime), inline: true },
        { name: "Memory", value: `${memMB} MB`, inline: true },
        { name: "discord.js", value: `v${djsVersion}`, inline: true },
        { name: "Node.js", value: process.version, inline: true },
        { name: "ID", value: client.user.id, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
