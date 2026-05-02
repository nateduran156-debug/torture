const { SlashCommandBuilder } = require("discord.js");
const { success, error, info } = require("../../utils/embed");
const MusicManager = require("../../managers/MusicManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist in your voice channel")
    .addStringOption(o => o.setName("query").setDescription("Song name, YouTube URL, or playlist URL").setRequired(true)),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.voice.channel) return interaction.reply({ embeds: [error(interaction, "You must be in a voice channel.")], ephemeral: true });

    await interaction.deferReply();
    const query = interaction.options.getString("query");

    try {
      const tracks = await MusicManager.search(query);
      if (!tracks.length) return interaction.editReply({ embeds: [error(interaction, "No results found for that query.")] });

      const queue = MusicManager.getOrCreate(interaction.guild.id);
      queue.textChannel = interaction.channel;

      if (!queue.connection) await queue.join(member.voice.channel);

      for (const t of tracks) t.requesterId = interaction.user.id;
      for (const t of tracks) await queue.add(t);

      if (tracks.length === 1) {
        const t = tracks[0];
        const embed = info(interaction, null, `Added **[${t.title}](${t.url})** to the queue.`).setThumbnail(t.thumbnail ?? null);
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({ embeds: [success(interaction, `Added **${tracks.length}** tracks to the queue.`)] });
      }
    } catch (err2) {
      await interaction.editReply({ embeds: [error(interaction, `Failed to play: ${err2.message}`)] });
    }
  },
};
