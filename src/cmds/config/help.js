const { SlashCommandBuilder } = require("discord.js");
const { info, error } = require("../../utils/embed");
const config = require("../../../config.json");

// Category labels mapped from directory names embedded in the module path
const CATEGORY_LABELS = {
  config:       "⚙️  Configuration",
  moderation:   "🔨 Moderation",
  fun:          "🎉 Fun",
  economy:      "💰 Economy",
  leveling:     "⭐ Leveling",
  lastfm:       "🎵 Last.fm",
  giveaway:     "🎁 Giveaway",
  integrations: "🔗 Integrations",
  utility:      "🔧 Utility",
};

/**
 * Derive a category name from the command module's filename path.
 * require.resolve returns the absolute path, so we look for a known
 * category segment in it.
 */
function getCategory(command) {
  // Commands loaded via require() have their filename accessible via
  // the module cache. We walk the cache to find the matching export.
  try {
    for (const [filePath, mod] of Object.entries(require.cache)) {
      if (mod.exports === command) {
        const parts = filePath.replace(/\\/g, "/").split("/");
        const cmdsIdx = parts.lastIndexOf("cmds");
        if (cmdsIdx !== -1 && parts[cmdsIdx + 1]) {
          return parts[cmdsIdx + 1];
        }
      }
    }
  } catch {
    // fall through
  }
  return "other";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all available commands or get details about a specific one")
    .addStringOption(o =>
      o.setName("command")
        .setDescription("Command name to get detailed help for")
        .setRequired(false)
    ),

  async execute(interaction) {
    const prefix = "-";
    const commandName = interaction.options.getString("command")?.toLowerCase();

    // ── Detailed help for a specific command ────────────────────────────
    if (commandName) {
      const cmd = interaction.client.commands.get(commandName)
        ?? interaction.client.commands.find(c => c.data?.name === commandName);

      if (!cmd) {
        return interaction.reply({
          embeds: [error(interaction, `No command named \`${commandName}\` was found.`)],
          ephemeral: true,
        });
      }

      const raw = typeof cmd.data.toJSON === "function" ? cmd.data.toJSON() : cmd.data;
      const subcommands = (raw.options ?? []).filter(o => o.type === 1 || o.type === 2);
      const options     = (raw.options ?? []).filter(o => o.type !== 1 && o.type !== 2);

      const fields = [];

      if (subcommands.length) {
        fields.push({
          name: "Subcommands",
          value: subcommands
            .map(s => `\`${prefix}${raw.name} ${s.name}\` — ${s.description}`)
            .join("\n"),
          inline: false,
        });
      }

      if (options.length) {
        fields.push({
          name: "Options",
          value: options
            .map(o => `\`${o.name}\`${o.required ? " *(required)*" : ""} — ${o.description}`)
            .join("\n"),
          inline: false,
        });
      }

      fields.push({
        name: "Usage",
        value: `\`${prefix}${raw.name}${subcommands.length ? " <subcommand>" : ""}${options.length ? " [options]" : ""}\``,
        inline: false,
      });

      return interaction.reply({
        embeds: [
          info(interaction, `${config.emojis.dot} ${raw.name}`, raw.description, fields),
        ],
      });
    }

    // ── Full command list grouped by category ────────────────────────────
    const grouped = new Map();

    for (const [, cmd] of interaction.client.commands) {
      const cat = getCategory(cmd);
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(cmd);
    }

    // Sort categories and build embed fields
    const fields = [];
    const sortedCats = [...grouped.keys()].sort((a, b) => {
      // Put "config" first, then alphabetical
      if (a === "config") return -1;
      if (b === "config") return 1;
      return a.localeCompare(b);
    });

    for (const cat of sortedCats) {
      const cmds = grouped.get(cat);
      const label = CATEGORY_LABELS[cat] ?? `📁 ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
      fields.push({
        name: label,
        value: cmds.map(c => `\`${prefix}${c.data.name}\``).join("  "),
        inline: false,
      });
    }

    const total = interaction.client.commands.size;

    return interaction.reply({
      embeds: [
        info(
          interaction,
          "📖 Command List",
          `Use \`${prefix}help <command>\` to get detailed info about a specific command.\n\n**${total}** commands available.`,
          fields
        ),
      ],
    });
  },
};
