const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { base, error } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("List server members or resources")
    .addSubcommand(s => s.setName("inrole").setDescription("Members with a specific role").addRoleOption(o => o.setName("role").setDescription("Role to check").setRequired(true)))
    .addSubcommand(s => s.setName("bots").setDescription("All bots in the server"))
    .addSubcommand(s => s.setName("admins").setDescription("Members with Administrator permission"))
    .addSubcommand(s => s.setName("mods").setDescription("Members with kick/ban/manage messages"))
    .addSubcommand(s => s.setName("roles").setDescription("All roles in the server"))
    .addSubcommand(s => s.setName("emojis").setDescription("All custom emojis in the server")),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();
    const g   = interaction.guild;
    await g.members.fetch().catch(() => {});

    if (sub === "inrole") {
      const role    = interaction.options.getRole("role");
      const members = role.members.map(m => `${m.user.tag} (\`${m.id}\`)`);
      if (!members.length) return interaction.editReply({ embeds: [error(interaction, `No members have the role ${role}.`)] });
      return sendList(interaction, `Members in ${role.name} [${members.length}]`, members);
    }

    if (sub === "bots") {
      const bots = g.members.cache.filter(m => m.user.bot).map(m => `${m.user.tag} (\`${m.id}\`)`);
      return sendList(interaction, `Bots [${bots.length}]`, bots);
    }

    if (sub === "admins") {
      const admins = g.members.cache.filter(m => !m.user.bot && m.permissions.has(PermissionFlagsBits.Administrator)).map(m => `${m.user.tag} (\`${m.id}\`)`);
      return sendList(interaction, `Administrators [${admins.length}]`, admins);
    }

    if (sub === "mods") {
      const mods = g.members.cache.filter(m =>
        !m.user.bot &&
        (m.permissions.has(PermissionFlagsBits.KickMembers) ||
         m.permissions.has(PermissionFlagsBits.BanMembers) ||
         m.permissions.has(PermissionFlagsBits.ManageMessages))
      ).map(m => `${m.user.tag} (\`${m.id}\`)`);
      return sendList(interaction, `Moderators [${mods.length}]`, mods);
    }

    if (sub === "roles") {
      const roles = [...g.roles.cache.values()].sort((a, b) => b.position - a.position).filter(r => r.name !== "@everyone").map(r => `${r.name} (\`${r.id}\`)`);
      return sendList(interaction, `Roles [${roles.length}]`, roles);
    }

    if (sub === "emojis") {
      const emojis = [...g.emojis.cache.values()].map(e => `${e} \`:${e.name}:\``);
      if (!emojis.length) return interaction.editReply({ embeds: [error(interaction, "This server has no custom emojis.")] });
      return sendList(interaction, `Emojis [${emojis.length}]`, emojis);
    }
  },
};

async function sendList(interaction, title, items) {
  const chunkSize = 20;
  const chunks    = [];
  for (let i = 0; i < items.length; i += chunkSize) chunks.push(items.slice(i, i + chunkSize));

  const embed = base(interaction)
    .setTitle(title)
    .setDescription(chunks[0].join("\n").slice(0, 4096))
    .setColor(0x2b2d31);

  if (chunks.length > 1) embed.setFooter({ text: `Showing first ${chunkSize} of ${items.length}` });

  return interaction.editReply({ embeds: [embed] });
}
