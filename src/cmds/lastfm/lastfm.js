const { SlashCommandBuilder } = require("discord.js");
const { success, error, info, base } = require("../../utils/embed");
const { getLastfm, setLastfm, removeLastfm } = require("../../utils/database");
const axios = require("axios");

async function lfmGet(params) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new Error("LASTFM_API_KEY not set in .env");
  const { data } = await axios.get("http://ws.audioscrobbler.com/2.0/", { params: { ...params, api_key: key, format: "json" } });
  if (data.error) throw new Error(data.message);
  return data;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lastfm")
    .setDescription("Manage your Last.fm account")
    .addSubcommand(s => s.setName("set").setDescription("Set your Last.fm username").addStringOption(o => o.setName("username").setDescription("Your Last.fm username").setRequired(true)))
    .addSubcommand(s => s.setName("logout").setDescription("Unlink your Last.fm account"))
    .addSubcommand(s => s.setName("profile").setDescription("View a Last.fm profile").addUserOption(o => o.setName("user").setDescription("User to view")))
    .addSubcommand(s => s.setName("mode").setDescription("View or set display mode").addStringOption(o => o.setName("mode").setDescription("embed mode").addChoices({ name: "Embed", value: "embed" }, { name: "Text", value: "text" }))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "set") {
      const username = interaction.options.getString("username");
      try {
        const data = await lfmGet({ method: "user.getinfo", user: username });
        setLastfm(interaction.user.id, username);
        const embed = success(interaction, `Linked Last.fm account **[${data.user.name}](${data.user.url})**.`).setThumbnail(data.user.image?.[2]?.["#text"] || null);
        return interaction.reply({ embeds: [embed] });
      } catch {
        return interaction.reply({ embeds: [error(interaction, `User **${username}** not found on Last.fm.`)], ephemeral: true });
      }
    }

    if (sub === "logout") {
      if (!getLastfm(interaction.user.id)) return interaction.reply({ embeds: [error(interaction, "You don't have a Last.fm account linked.")], ephemeral: true });
      removeLastfm(interaction.user.id);
      return interaction.reply({ embeds: [success(interaction, "Unlinked your Last.fm account.")] });
    }

    if (sub === "profile") {
      const target = interaction.options.getUser("user") ?? interaction.user;
      const username = getLastfm(target.id);
      if (!username) return interaction.reply({ embeds: [error(interaction, target.id === interaction.user.id ? "You haven't linked a Last.fm account. Use `/lastfm set`." : `**${target.username}** hasn't linked a Last.fm account.`)], ephemeral: true });
      try {
        const data = await lfmGet({ method: "user.getinfo", user: username });
        const u = data.user;
        const embed = base(interaction)
          .setTitle(u.name)
          .setURL(u.url)
          .setThumbnail(u.image?.[2]?.["#text"] || null)
          .addFields(
            { name: "Scrobbles", value: parseInt(u.playcount).toLocaleString(), inline: true },
            { name: "Artists", value: parseInt(u.artist_count || 0).toLocaleString(), inline: true },
            { name: "Albums", value: parseInt(u.album_count || 0).toLocaleString(), inline: true },
            { name: "Tracks", value: parseInt(u.track_count || 0).toLocaleString(), inline: true },
            { name: "Registered", value: `<t:${u.registered?.unixtime}:D>`, inline: true },
          );
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        return interaction.reply({ embeds: [error(interaction, e.message)], ephemeral: true });
      }
    }

    if (sub === "mode") {
      return interaction.reply({ embeds: [info(interaction, null, "Display mode is for visual preference only.")] });
    }
  },
};

module.exports.lfmGet = lfmGet;
