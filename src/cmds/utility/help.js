const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
} = require("discord.js");
const { LOGO } = require("../../utils/embed");
const config   = require("../../../config.json");

const COLOR = config.colors?.default ?? 0x2b2d31;

// ─────────────────────────────────────────────
// Category definitions
// ─────────────────────────────────────────────
const ALL = {
  // ── Main menu ──
  moderation: {
    emoji: "🛡️", label: "Moderation",
    commands: ["ban","unban","kick","softban","hardban","hackban","tempban","mute","unmute","warn","warnings","delwarn","clearwarns","jail","unjail","purge","lock","unlock","slowmode","nick","role","strip","stripstaff","deafen","undeafen","move","setup","antinuke"],
  },
  utility: {
    emoji: "🔧", label: "Utility",
    commands: ["avatar","banner","serverinfo","userinfo","roleinfo","ping","uptime","botinfo","snipe","editsnipe","steal","stealemoji","emojiinfo","inviteinfo","membercount","icon","color","reminder","poll","todo","prefix","afk","urban","calc","list","translate","hack","crypto","weather"],
  },
  fun: {
    emoji: "🎉", label: "Fun",
    commands: ["8ball","coinflip","roll","rps","joke","meme","ship","rate","pp","gay","roast","compliment","fact","hug","kiss","slap","pat","truth","dare"],
  },
  economy: {
    emoji: "💰", label: "Economy",
    commands: ["balance","daily","weekly","work","beg","crime","rob","deposit","withdraw","pay","slots","shop","buy","inventory","leaderboard"],
  },
  leveling: {
    emoji: "📊", label: "Leveling",
    commands: ["rank","levels","xpleaderboard"],
  },
  music: {
    emoji: "🎵", label: "Music",
    commands: ["play","queue","nowplaying","skip","pause","resume","stop","volume","shuffle","loop","remove","clearqueue","lyrics"],
  },
  lastfm: {
    emoji: "🎸", label: "Last.fm",
    commands: ["lastfm","fmset","np","recenttracks","topartists","toptracks","topalbums","whoknows","taste"],
  },
  integrations: {
    emoji: "🎮", label: "Integrations",
    commands: ["fortnite","webhook"],
  },
  // ── Extra menu ──
  config: {
    emoji: "⚙️", label: "Config",
    commands: ["welcome","goodbye","boost","log","alias","autoresponder","timer","reactiontrigger","bumpreminder","reactionrole","buttonrole","boosterrole","starboard","clownboard","counter","voicemaster","tickets","autorole","bind","settings"],
  },
  giveaway: {
    emoji: "🎊", label: "Giveaway",
    commands: ["giveaway"],
  },
  tracking: {
    emoji: "📈", label: "Tracking",
    commands: ["tracking"],
  },
  sticky: {
    emoji: "📌", label: "Sticky",
    commands: ["sticky"],
  },
  counting: {
    emoji: "🔢", label: "Counting",
    commands: ["counting"],
  },
  ignore: {
    emoji: "🚫", label: "Ignore",
    commands: ["ignore"],
  },
};

const MAIN_KEYS  = ["moderation","utility","fun","economy","leveling","music","lastfm","integrations"];
const EXTRA_KEYS = ["config","giveaway","tracking","sticky","counting","ignore"];

const TOTAL = Object.values(ALL).reduce((n, c) => n + c.commands.length, 0);

// ─────────────────────────────────────────────
// Builders
// ─────────────────────────────────────────────
function homeOption() {
  return new StringSelectMenuOptionBuilder().setLabel("Home").setValue("home").setEmoji("🏠");
}

function mainSelectRow(userId) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`help_main_${userId}`)
      .setPlaceholder("📚 Main Categories")
      .addOptions(
        homeOption(),
        ...MAIN_KEYS.map(k =>
          new StringSelectMenuOptionBuilder()
            .setLabel(ALL[k].label)
            .setValue(k)
            .setEmoji(ALL[k].emoji)
            .setDescription(`${ALL[k].commands.length} commands`)
        )
      )
  );
}

function extraSelectRow(userId) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`help_extra_${userId}`)
      .setPlaceholder("📂 Extra Categories")
      .addOptions(
        homeOption(),
        ...EXTRA_KEYS.map(k =>
          new StringSelectMenuOptionBuilder()
            .setLabel(ALL[k].label)
            .setValue(k)
            .setEmoji(ALL[k].emoji)
            .setDescription(`${ALL[k].commands.length} commands`)
        )
      )
  );
}

function buildHomeContainer(client, userId) {
  const catLines = [...MAIN_KEYS, ...EXTRA_KEYS]
    .map(k => `${ALL[k].emoji}  **${ALL[k].label}**  —  \`${ALL[k].commands.length} commands\``)
    .join("\n");

  return new ContainerBuilder()
    .setAccentColor(COLOR)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${client.user.username}`)
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${TOTAL} commands across ${Object.keys(ALL).length} categories\n\u200b\n` +
        catLines +
        `\n\u200b\n-# Select a category from the menus below`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(mainSelectRow(userId))
    .addActionRowComponents(extraSelectRow(userId));
}

function buildCategoryContainer(catKey, userId) {
  const cat = ALL[catKey];
  if (!cat) return null;

  const cmds = cat.commands.map(c => `\`${c}\``).join("  ");

  return new ContainerBuilder()
    .setAccentColor(COLOR)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${cat.emoji}  ${cat.label} Commands`)
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${cat.commands.length} commands\n\n${cmds}`)
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(mainSelectRow(userId))
    .addActionRowComponents(extraSelectRow(userId));
}

// ─────────────────────────────────────────────
// Exports (used by interactionCreate)
// ─────────────────────────────────────────────
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Browse all bot commands")
    .addStringOption(o => o.setName("input").setDescription("Command or category name")),

  buildHomeContainer,
  buildCategoryContainer,
  ALL,
  MAIN_KEYS,
  EXTRA_KEYS,

  async execute(interaction) {
    const input  = interaction.options?.getString?.("input")?.toLowerCase().trim();
    const client = interaction.client;
    const userId = interaction.user.id;

    // ── Single command info ─────────────────────────────────────────────
    if (input) {
      const matchedCmd = client.commands.get(input);
      if (matchedCmd) {
        const d    = typeof matchedCmd.data.toJSON === "function" ? matchedCmd.data.toJSON() : matchedCmd.data;
        const subs = (d.options ?? []).filter(o => o.type === 1);
        const opts = (d.options ?? []).filter(o => o.type !== 1 && o.type !== 2);

        const { base } = require("../../utils/embed");
        const embed = base(interaction)
          .setAuthor({ name: d.name, iconURL: LOGO })
          .setDescription(d.description)
          .setTimestamp();

        if (subs.length) embed.addFields({ name: "Subcommands", value: subs.map(s => `\`${s.name}\` — ${s.description}`).join("\n") });
        if (opts.length) embed.addFields({ name: "Options",     value: opts.map(o => `\`${o.name}\` ${o.required ? "**(required)**" : "(optional)"} — ${o.description}`).join("\n") });
        embed.addFields({ name: "Usage", value: `\`-${d.name}${opts.length ? " " + opts.map(o => o.required ? `[${o.name}]` : `<${o.name}>`).join(" ") : ""}\`` });

        return interaction.reply({ embeds: [embed] });
      }

      // category by name
      const catKey = Object.entries(ALL).find(([k, c]) =>
        k === input || c.label.toLowerCase() === input
      )?.[0];

      if (catKey) {
        return interaction.reply({
          flags:      MessageFlags.IsComponentsV2,
          components: [buildCategoryContainer(catKey, userId)],
        });
      }
    }

    // ── Home page ───────────────────────────────────────────────────────
    return interaction.reply({
      flags:      MessageFlags.IsComponentsV2,
      components: [buildHomeContainer(client, userId)],
    });
  },
};
