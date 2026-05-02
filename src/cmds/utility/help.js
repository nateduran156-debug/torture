const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { LOGO } = require("../../utils/embed");
const config = require("../../../config.json");

const ARROW = "›";
const DOT   = "•";
const COLOR = config.colors.default;

const categories = {
  moderation:   { emoji: "🛡️", label: "Moderation",   commands: ["ban","unban","kick","softban","hardban","hackban","tempban","mute","unmute","warn","warnings","delwarn","clearwarns","jail","unjail","purge","lock","unlock","slowmode","nick","role","strip","stripstaff","deafen","undeafen","move","setup","antinuke"] },
  utility:      { emoji: "🔧", label: "Utility",       commands: ["avatar","banner","serverinfo","userinfo","roleinfo","ping","uptime","botinfo","snipe","editsnipe","steal","stealemoji","emojiinfo","inviteinfo","membercount","icon","color","reminder","poll","todo","prefix"] },
  fun:          { emoji: "🎉", label: "Fun",            commands: ["8ball","coinflip","roll","rps","joke","meme","ship","rate","pp","gay","roast","compliment","fact","hug","kiss","slap","pat"] },
  economy:      { emoji: "💰", label: "Economy",        commands: ["balance","daily","weekly","work","beg","crime","rob","deposit","withdraw","pay","slots","shop","buy","inventory","leaderboard"] },
  leveling:     { emoji: "📊", label: "Leveling",       commands: ["rank","levels","xpleaderboard"] },
  giveaway:     { emoji: "🎊", label: "Giveaway",       commands: ["giveaway"] },
  music:        { emoji: "🎵", label: "Music",          commands: ["play","queue","nowplaying","skip","pause","resume","stop","volume","shuffle","loop","remove","clearqueue","lyrics"] },
  lastfm:       { emoji: "🎸", label: "Last.fm",        commands: ["lastfm","fmset","np","recenttracks","topartists","toptracks","topalbums","whoknows","taste"] },
  config:       { emoji: "⚙️", label: "Config",         commands: ["welcome","goodbye","boost","log","alias","autoresponder","timer","reactiontrigger","bumpreminder","reactionrole","buttonrole","boosterrole","starboard","clownboard","counter","voicemaster","tickets","autorole","bind","settings"] },
  integrations: { emoji: "🎮", label: "Integrations",   commands: ["fortnite","webhook"] },
};

const total = Object.values(categories).reduce((n, c) => n + c.commands.length, 0);

// Exported so interactionCreate can reuse them
function buildFooter(interaction) {
  return { text: `${interaction?.user?.username ?? "luna"} ${DOT} luna`, iconURL: LOGO };
}

function buildCategoryButtons(userId) {
  const entries = Object.entries(categories);
  const rows = [];
  // 5 buttons per row, max 2 rows (10 buttons = all 10 categories)
  for (let i = 0; i < entries.length; i += 5) {
    const row = new ActionRowBuilder();
    for (const [key, cat] of entries.slice(i, i + 5)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`help_cat_${userId}_${key}`)
          .setLabel(cat.label)
          .setEmoji(cat.emoji)
          .setStyle(ButtonStyle.Secondary)
      );
    }
    rows.push(row);
  }
  return rows;
}

function buildBackButton(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`help_main_${userId}`)
      .setLabel("Back")
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildMainEmbed(client) {
  const catLines = Object.values(categories)
    .map(c => `${ARROW} ${c.emoji} **${c.label}** \`${c.commands.length}\``)
    .join("\n");

  return new EmbedBuilder()
    .setColor(COLOR)
    .setAuthor({ name: client.user.username, iconURL: LOGO })
    .setThumbnail(LOGO)
    .setDescription(
      `-# ${total} commands across ${Object.keys(categories).length} categories\n` +
      `\u200b\n` +
      catLines +
      `\n\u200b\n` +
      `-# click a category below or use \`-help [command]\``
    )
    .setTimestamp();
}

function buildCategoryEmbed(catKey, interaction) {
  const cat = categories[catKey];
  if (!cat) return null;

  const cmds = cat.commands;
  const rows = [];
  let row = [];
  let rowLen = 0;
  for (const c of cmds) {
    const token = `\`${c}\``;
    if (rowLen + token.length + 2 > 60 && row.length) {
      rows.push(row.join("  "));
      row = [];
      rowLen = 0;
    }
    row.push(token);
    rowLen += token.length + 2;
  }
  if (row.length) rows.push(row.join("  "));

  return new EmbedBuilder()
    .setColor(COLOR)
    .setAuthor({ name: `${cat.emoji}  ${cat.label}`, iconURL: LOGO })
    .setThumbnail(LOGO)
    .setDescription(
      `-# ${cat.commands.length} commands\n\n` +
      rows.join("\n")
    )
    .setFooter(buildFooter(interaction))
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all commands")
    .addStringOption(o => o.setName("input").setDescription("A category name or command name")),

  // Export helpers for interactionCreate
  buildMainEmbed,
  buildCategoryEmbed,
  buildCategoryButtons,
  buildBackButton,
  categories,

  async execute(interaction) {
    const input  = interaction.options.getString("input")?.toLowerCase().trim();
    const client = interaction.client;
    const userId = interaction.user.id;

    // ── Command info card ────────────────────────────────────────────────
    const matchedCmd = input ? client.commands.get(input) : null;
    if (matchedCmd) {
      const d    = typeof matchedCmd.data.toJSON === "function" ? matchedCmd.data.toJSON() : matchedCmd.data;
      const subs = (d.options ?? []).filter(o => o.type === 1);
      const opts = (d.options ?? []).filter(o => o.type !== 1 && o.type !== 2);

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setAuthor({ name: d.name, iconURL: LOGO })
        .setDescription(d.description)
        .setFooter(buildFooter(interaction))
        .setTimestamp();

      if (subs.length) {
        embed.addFields({
          name: "Subcommands",
          value: subs.map(s => `\`${s.name}\` — ${s.description}`).join("\n"),
        });
      }
      if (opts.length) {
        embed.addFields({
          name: "Options",
          value: opts.map(o =>
            `\`${o.name}\` ${o.required ? "**(required)**" : "(optional)"} — ${o.description}`
          ).join("\n"),
        });
      }
      embed.addFields({
        name: "Usage",
        value: `\`-${d.name}${opts.length ? " " + opts.map(o => o.required ? `[${o.name}]` : `<${o.name}>`).join(" ") : ""}\``,
      });

      return interaction.reply({ embeds: [embed] });
    }

    // ── Category typed directly ──────────────────────────────────────────
    if (input) {
      const match = Object.entries(categories).find(
        ([key, c]) => key === input || c.label.toLowerCase() === input
      );
      if (match) {
        const [key] = match;
        return interaction.reply({
          embeds: [buildCategoryEmbed(key, interaction)],
          components: [buildBackButton(userId)],
        });
      }
    }

    // ── Main help page with buttons ──────────────────────────────────────
    const embed = buildMainEmbed(client).setFooter(buildFooter(interaction));
    await interaction.reply({
      embeds: [embed],
      components: buildCategoryButtons(userId),
    });
  },
};
