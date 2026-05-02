const { SlashCommandBuilder } = require("discord.js");
const { base, info, LOGO } = require("../../utils/embed");

const categories = {
  "🛡️ Moderation": ["ban", "unban", "kick", "softban", "hardban", "hackban", "tempban", "mute", "unmute", "warn", "warnings", "delwarn", "clearwarns", "jail", "unjail", "purge", "lock", "unlock", "slowmode", "deafen", "undeafen", "move", "nick", "role", "strip", "stripstaff", "setup", "antinuke"],
  "🔧 Utility": ["avatar", "banner", "serverinfo", "userinfo", "roleinfo", "ping", "uptime", "botinfo", "snipe", "editsnipe", "steal", "stealemoji", "emojiinfo", "inviteinfo", "membercount", "icon", "color", "reminder", "poll", "todo", "prefix"],
  "🎉 Fun": ["8ball", "coinflip", "roll", "rps", "joke", "meme", "ship", "rate", "pp", "gay", "roast", "compliment", "fact", "hug", "kiss", "slap", "pat"],
  "💰 Economy": ["balance", "daily", "weekly", "work", "deposit", "withdraw", "pay", "leaderboard", "shop", "buy", "inventory", "rob", "slots", "beg", "crime"],
  "📊 Leveling": ["rank", "levels", "xpleaderboard"],
  "🎊 Giveaways": ["giveaway"],
  "🎵 Music": ["play", "queue", "nowplaying", "skip", "pause", "resume", "stop", "volume", "shuffle", "loop", "remove", "clearqueue", "lyrics"],
  "🎸 Last.fm": ["lastfm", "fmset", "np", "recenttracks", "topartists", "toptracks", "topalbums", "whoknows", "taste"],
  "🎮 Integrations": ["fortnite", "webhook"],
  "⚙️ Config": ["welcome", "goodbye", "boost", "log", "alias", "autoresponder", "timer", "reactiontrigger", "bumpreminder", "reactionrole", "buttonrole", "boosterrole", "starboard", "clownboard", "counter", "levels", "voicemaster", "tickets", "autorole", "bind", "settings"],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all commands and categories")
    .addStringOption(o => o.setName("command").setDescription("Get detailed info on a specific command")),

  async execute(interaction) {
    const cmd = interaction.options.getString("command");

    if (cmd) {
      const found = interaction.client.commands.get(cmd.toLowerCase());
      if (!found) return interaction.reply({ embeds: [info(interaction, null, `No command found named \`${cmd}\`.`)], ephemeral: true });
      const embed = base(interaction)
        .setTitle("/" + found.data.name)
        .setDescription(found.data.description ?? "No description.");
      return interaction.reply({ embeds: [embed] });
    }

    const embed = base(interaction)
      .setTitle(`${interaction.client.user.username} — Commands`)
      .setThumbnail(LOGO)
      .setDescription("Use `/help <command>` for more info on a specific command.");

    for (const [cat, cmds] of Object.entries(categories)) {
      embed.addFields({ name: cat, value: cmds.map(c => `\`${c}\``).join(", ") });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
