const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getCounters, saveCounters } = require("../../utils/database");

const COUNTER_TYPES = ["members", "users_only", "bots_only", "text_channels", "voice_channels", "categories", "boosts"];
const CHANNEL_TYPES = { voice: ChannelType.GuildVoice, text: ChannelType.GuildText, category: ChannelType.GuildCategory };

async function updateCounter(guild, counter) {
  const ch = guild.channels.cache.get(counter.channelId);
  if (!ch) return;
  let count;
  switch (counter.option) {
    case "members": count = guild.memberCount; break;
    case "users_only": count = guild.members.cache.filter(m => !m.user.bot).size; break;
    case "bots_only": count = guild.members.cache.filter(m => m.user.bot).size; break;
    case "text_channels": count = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size; break;
    case "voice_channels": count = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size; break;
    case "categories": count = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size; break;
    case "boosts": count = guild.premiumSubscriptionCount; break;
    default: count = 0;
  }
  await ch.setName(`${counter.option}: ${count}`).catch(() => {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counter")
    .setDescription("Manage server counters")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("add").setDescription("Add a counter channel")
      .addStringOption(o => o.setName("option").setDescription("What to count").setRequired(true).addChoices(...COUNTER_TYPES.map(t => ({ name: t, value: t }))))
      .addStringOption(o => o.setName("type").setDescription("Channel type").setRequired(true).addChoices({ name: "voice", value: "voice" }, { name: "text", value: "text" }, { name: "category", value: "category" })))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a counter").addStringOption(o => o.setName("channel_id").setDescription("Channel ID").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all counters")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const counters = getCounters(interaction.guild.id);

    if (sub === "add") {
      const option = interaction.options.getString("option");
      const type = interaction.options.getString("type");
      const chType = CHANNEL_TYPES[type];
      try {
        const ch = await interaction.guild.channels.create({ name: `${option}: 0`, type: chType, reason: "Counter channel" });
        if (chType !== ChannelType.GuildCategory) await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false }).catch(() => {});
        counters.push({ channelId: ch.id, option, type });
        saveCounters(interaction.guild.id, counters);
        await updateCounter(interaction.guild, { channelId: ch.id, option });
        return interaction.reply({ embeds: [success(interaction, `Created counter channel for **${option}**.`)] });
      } catch { return interaction.reply({ embeds: [error(interaction, "Failed to create counter channel.")], ephemeral: true }); }
    }
    if (sub === "remove") {
      const channelId = interaction.options.getString("channel_id");
      const idx = counters.findIndex(c => c.channelId === channelId);
      if (idx < 0) return interaction.reply({ embeds: [error(interaction, "Counter not found.")], ephemeral: true });
      counters.splice(idx, 1);
      saveCounters(interaction.guild.id, counters);
      return interaction.reply({ embeds: [success(interaction, `Removed counter <#${channelId}>. You can delete the channel manually.`)] });
    }
    if (sub === "list") {
      if (!counters.length) return interaction.reply({ embeds: [info(interaction, null, "No counters configured.")], ephemeral: true });
      return interaction.reply({ embeds: [info(interaction, `Counters (${counters.length})`, counters.map(c => `<#${c.channelId}> — **${c.option}**`).join("\n"))], ephemeral: true });
    }
  },

  updateCounter,
};
