const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the current music queue")
    .addIntegerOption(o => o.setName("page").setDescription("Page number").setMinValue(1)),

  async execute(interaction) {
    const queue = MusicManager.get(interaction.guild.id);
    if (!queue || (!queue.current && !queue.tracks.length))
      return interaction.reply({ embeds: [info(interaction, null, "The queue is empty.")], ephemeral: true });

    const page = (interaction.options.getInteger("page") ?? 1) - 1;
    const perPage = 10;
    const start = page * perPage;
    const tracks = queue.tracks.slice(start, start + perPage);

    const embed = base(interaction).setTitle("🎵 Music Queue").addFields(
      { name: "Now Playing", value: queue.current ? `[${queue.current.title}](${queue.current.url})` : "Nothing" }
    );

    if (tracks.length) {
      embed.addFields({ name: `Up Next (${queue.tracks.length} total)`, value: tracks.map((t, i) => `**${start + i + 1}.** [${t.title}](${t.url}) — <@${t.requesterId}>`).join("\n") });
    }

    embed.setFooter({ text: `Loop: ${queue.loop} • Volume: ${queue.volume}%` });
    await interaction.reply({ embeds: [embed] });
  },
};
