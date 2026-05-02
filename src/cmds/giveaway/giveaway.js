const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { base, success, error, noPerms } = require("../../utils/embed");
const { getGiveaways, saveGiveaways } = require("../../utils/database");
const { parseDuration, formatDuration } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Manage giveaways")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("start").setDescription("Start a giveaway")
      .addStringOption(o => o.setName("duration").setDescription("Duration (e.g. 1h, 1d)").setRequired(true))
      .addStringOption(o => o.setName("prize").setDescription("What to give away").setRequired(true))
      .addIntegerOption(o => o.setName("winners").setDescription("Number of winners").setMinValue(1).setMaxValue(10)))
    .addSubcommand(s => s.setName("end").setDescription("End a giveaway early")
      .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true)))
    .addSubcommand(s => s.setName("reroll").setDescription("Reroll a giveaway")
      .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true)))
    .addSubcommandGroup(g => g.setName("edit").setDescription("Edit a giveaway")
      .addSubcommand(s => s.setName("prize").setDescription("Change the giveaway prize")
        .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true))
        .addStringOption(o => o.setName("prize").setDescription("New prize").setRequired(true)))
      .addSubcommand(s => s.setName("host").setDescription("Change the giveaway host")
        .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true))
        .addUserOption(o => o.setName("host").setDescription("New host").setRequired(true)))
      .addSubcommand(s => s.setName("duration").setDescription("Change the giveaway duration")
        .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true))
        .addStringOption(o => o.setName("duration").setDescription("New duration from now").setRequired(true)))),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Guild")], ephemeral: true });

    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    if (group === "edit") {
      const msgId = interaction.options.getString("message_id");
      const giveaways = getGiveaways();
      const gw = giveaways[msgId];
      if (!gw || gw.ended) return interaction.reply({ embeds: [error(interaction, "Giveaway not found or already ended.")], ephemeral: true });

      if (sub === "prize") {
        const prize = interaction.options.getString("prize");
        gw.prize = prize;
        saveGiveaways(giveaways);
        await updateGiveawayMessage(interaction.client, msgId, gw);
        return interaction.reply({ embeds: [success(interaction, `Updated giveaway prize to **${prize}**.`)] });
      }
      if (sub === "host") {
        const host = interaction.options.getUser("host");
        gw.hostId = host.id;
        saveGiveaways(giveaways);
        await updateGiveawayMessage(interaction.client, msgId, gw);
        return interaction.reply({ embeds: [success(interaction, `Updated giveaway host to **${host.username}**.`)] });
      }
      if (sub === "duration") {
        const durationStr = interaction.options.getString("duration");
        const ms = parseDuration(durationStr);
        if (!ms) return interaction.reply({ embeds: [error(interaction, "Invalid duration.")], ephemeral: true });
        gw.endsAt = Date.now() + ms;
        saveGiveaways(giveaways);
        await updateGiveawayMessage(interaction.client, msgId, gw);
        setTimeout(async () => {
          const gws = getGiveaways();
          const g = gws[msgId];
          if (!g || g.ended) return;
          await endGiveaway(interaction.client, msgId, g);
          gws[msgId].ended = true;
          saveGiveaways(gws);
        }, ms);
        return interaction.reply({ embeds: [success(interaction, `Updated giveaway duration. Ends <t:${Math.floor(gw.endsAt / 1000)}:R>.`)] });
      }
    }

    if (sub === "start") {
      const durationStr = interaction.options.getString("duration");
      const prize = interaction.options.getString("prize");
      const winnerCount = interaction.options.getInteger("winners") ?? 1;
      const ms = parseDuration(durationStr);
      if (!ms) return interaction.reply({ embeds: [error(interaction, "Invalid duration.")], ephemeral: true });

      const endsAt = Date.now() + ms;
      const embed = base(interaction)
        .setTitle("🎉 GIVEAWAY 🎉")
        .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnerCount}\n**Hosted by:** <@${interaction.user.id}>\n\nEnds <t:${Math.floor(endsAt / 1000)}:R> • Click 🎉 to enter!`)
        .setColor(0xffd700);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("giveaway_enter").setLabel("🎉 Enter").setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [success(interaction, "Giveaway started!")], ephemeral: true });
      const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

      const giveaways = getGiveaways();
      giveaways[msg.id] = { prize, winnerCount, endsAt, channelId: interaction.channel.id, guildId: interaction.guild.id, hostId: interaction.user.id, entries: [], ended: false };
      saveGiveaways(giveaways);

      setTimeout(async () => {
        const gws = getGiveaways();
        const gw = gws[msg.id];
        if (!gw || gw.ended) return;
        await endGiveaway(interaction.client, msg.id, gw);
        gws[msg.id].ended = true;
        saveGiveaways(gws);
      }, ms);

    } else if (sub === "end" || sub === "reroll") {
      const msgId = interaction.options.getString("message_id");
      const giveaways = getGiveaways();
      const gw = giveaways[msgId];
      if (!gw) return interaction.reply({ embeds: [error(interaction, "Giveaway not found.")], ephemeral: true });
      await endGiveaway(interaction.client, msgId, gw);
      giveaways[msgId].ended = true;
      saveGiveaways(giveaways);
      await interaction.reply({ embeds: [success(interaction, `Giveaway ${sub === "reroll" ? "rerolled" : "ended"}.`)], ephemeral: true });
    }
  },
};

async function updateGiveawayMessage(client, msgId, gw) {
  try {
    const channel = await client.channels.fetch(gw.channelId);
    const msg = await channel.messages.fetch(msgId);
    const embed = msg.embeds[0];
    if (!embed) return;
    const { EmbedBuilder } = require("discord.js");
    const updated = EmbedBuilder.from(embed)
      .setDescription(`**Prize:** ${gw.prize}\n**Winners:** ${gw.winnerCount}\n**Hosted by:** <@${gw.hostId}>\n\nEnds <t:${Math.floor(gw.endsAt / 1000)}:R> • Click 🎉 to enter!`);
    await msg.edit({ embeds: [updated] });
  } catch {}
}

async function endGiveaway(client, msgId, gw) {
  try {
    const channel = await client.channels.fetch(gw.channelId);
    const msg = await channel.messages.fetch(msgId);
    const entries = gw.entries;
    const { base } = require("../../utils/embed");
    if (!entries.length) {
      await channel.send({ embeds: [base(null).setTitle("🎉 Giveaway Ended").setDescription(`No one entered the giveaway for **${gw.prize}**.`).setColor(0xff0000)] });
      return;
    }
    const winners = [];
    const pool = [...entries];
    for (let i = 0; i < Math.min(gw.winnerCount, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }
    const winnerMentions = winners.map(id => `<@${id}>`).join(", ");
    await channel.send({ content: winnerMentions, embeds: [base(null).setTitle("🎉 Giveaway Ended!").setDescription(`**Prize:** ${gw.prize}\n**Winner(s):** ${winnerMentions}`).setColor(0xffd700)] });
    await msg.edit({ components: [] }).catch(() => {});
  } catch {}
}
