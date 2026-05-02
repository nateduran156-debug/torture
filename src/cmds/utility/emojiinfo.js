const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emojiinfo")
    .setDescription("Get information about a custom emoji")
    .addStringOption(o => o.setName("emoji").setDescription("Custom emoji").setRequired(true)),
  async execute(interaction) {
    const raw = interaction.options.getString("emoji");
    const match = raw.match(/<(?:a?):(\w+):(\d+)>/);
    if (!match) return interaction.reply({ embeds: [error(interaction, "Provide a custom Discord emoji.")], ephemeral: true });

    const [, name, id] = match;
    const isAnimated = raw.startsWith("<a:");
    const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? "gif" : "png"}`;

    const embed = base(interaction)
      .setTitle(name)
      .setImage(url)
      .addFields(
        { name: "ID", value: id, inline: true },
        { name: "Animated", value: isAnimated ? "Yes" : "No", inline: true },
        { name: "URL", value: `[Click here](${url})`, inline: true },
      );

    const guild = interaction.client.guilds.cache.find(g => g.emojis.cache.has(id));
    if (guild) embed.addFields({ name: "Server", value: guild.name, inline: true });

    await interaction.reply({ embeds: [embed] });
  },
};
