const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Create the jail channel, jail role, and mute roles for moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [noPerms(interaction, "Administrator")], ephemeral: true });

    await interaction.deferReply();
    const cfg = getGuildConfig(interaction.guild.id);
    const guild = interaction.guild;
    const me = guild.members.me;
    const created = [];

    try {
      if (!cfg.mutedRole) {
        const muted = await guild.roles.create({ name: "Muted", color: "#818386", reason: "luna setup" });
        cfg.mutedRole = muted.id;
        for (const [, channel] of guild.channels.cache) {
          await channel.permissionOverwrites.create(muted, { SendMessages: false, AddReactions: false }).catch(() => {});
        }
        created.push("Muted role");
      }

      if (!cfg.imageMutedRole) {
        const imgMuted = await guild.roles.create({ name: "Image Muted", color: "#818386", reason: "luna setup" });
        cfg.imageMutedRole = imgMuted.id;
        for (const [, channel] of guild.channels.cache) {
          await channel.permissionOverwrites.create(imgMuted, { AttachFiles: false, EmbedLinks: false }).catch(() => {});
        }
        created.push("Image Muted role");
      }

      if (!cfg.reactionMutedRole) {
        const rMuted = await guild.roles.create({ name: "Reaction Muted", color: "#818386", reason: "luna setup" });
        cfg.reactionMutedRole = rMuted.id;
        for (const [, channel] of guild.channels.cache) {
          await channel.permissionOverwrites.create(rMuted, { AddReactions: false }).catch(() => {});
        }
        created.push("Reaction Muted role");
      }

      if (!cfg.jailRole) {
        const jailRole = await guild.roles.create({ name: "Jailed", color: "#ff0000", reason: "luna setup" });
        cfg.jailRole = jailRole.id;
        created.push("Jailed role");
      }

      if (!cfg.jailChannel) {
        const jailCh = await guild.channels.create({ name: "jail", topic: "Jailed members are restricted here.", reason: "luna setup" });
        await jailCh.permissionOverwrites.set([
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: cfg.jailRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages], deny: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
          { id: me, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
        ]);
        cfg.jailChannel = jailCh.id;

        const logCh = await guild.channels.create({ name: "jail-log", topic: "Moderation action logs.", reason: "luna setup" });
        await logCh.permissionOverwrites.set([
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.SendMessages] },
          { id: me, allow: [PermissionFlagsBits.SendMessages] },
        ]);
        cfg.logChannels = cfg.logChannels ?? {};
        cfg.logChannels.modlog = logCh.id;
        created.push("jail channel", "jail-log channel");
      }

      saveGuildConfig(guild.id, cfg);
      await interaction.editReply({ embeds: [success(interaction, `Setup complete!\n\nCreated: ${created.join(", ") || "Nothing new (already configured)"}`)] });
    } catch (e) {
      await interaction.editReply({ embeds: [error(interaction, `Setup failed: ${e.message}`)] });
    }
  },
};
