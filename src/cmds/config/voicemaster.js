const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { success, error, info, noPerms } = require("../../utils/embed");
const { getGuildConfig, saveGuildConfig, getTempChannels, saveTempChannels } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("voicemaster")
    .setDescription("Manage temporary voice channels")
    .addSubcommand(s => s.setName("setup").setDescription("(Admin) Set up the VoiceMaster system").setDefaultMemberPermissions(PermissionFlagsBits.Administrator))
    .addSubcommand(s => s.setName("name").setDescription("Rename your temp channel").addStringOption(o => o.setName("name").setDescription("New name").setRequired(true)))
    .addSubcommand(s => s.setName("limit").setDescription("Set user limit for your temp channel").addIntegerOption(o => o.setName("limit").setDescription("0 = unlimited").setRequired(true).setMinValue(0).setMaxValue(99)))
    .addSubcommand(s => s.setName("lock").setDescription("Lock your temp channel"))
    .addSubcommand(s => s.setName("unlock").setDescription("Unlock your temp channel"))
    .addSubcommand(s => s.setName("permit").setDescription("Permit a user to join your locked channel").addUserOption(o => o.setName("user").setDescription("User to permit").setRequired(true)))
    .addSubcommand(s => s.setName("kick").setDescription("Kick a user from your temp channel").addUserOption(o => o.setName("user").setDescription("User to kick").setRequired(true)))
    .addSubcommand(s => s.setName("transfer").setDescription("Transfer ownership of your temp channel").addUserOption(o => o.setName("user").setDescription("New owner").setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "setup") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [noPerms(interaction, "Administrator")], ephemeral: true });

      await interaction.deferReply();
      try {
        const category = await interaction.guild.channels.create({ name: "Voice Channels", type: ChannelType.GuildCategory });
        const joinToCreate = await interaction.guild.channels.create({ name: "➕ Join to Create", type: ChannelType.GuildVoice, parent: category.id });
        const interfaceCh = await interaction.guild.channels.create({ name: "interface", type: ChannelType.GuildText, parent: category.id });

        const cfg = getGuildConfig(interaction.guild.id);
        cfg.vmCategory = category.id;
        cfg.vmJoinChannel = joinToCreate.id;
        cfg.vmInterfaceChannel = interfaceCh.id;
        saveGuildConfig(interaction.guild.id, cfg);

        return interaction.editReply({ embeds: [success(interaction, `VoiceMaster set up!\n• Join **${joinToCreate.name}** to create a temp channel.\n• Use the **#interface** channel to manage it.`)] });
      } catch { return interaction.editReply({ embeds: [error(interaction, "Setup failed.")] }); }
    }

    const tempChannels = getTempChannels();
    const myChannel = Object.entries(tempChannels).find(([, d]) => d.ownerId === interaction.user.id && d.guildId === interaction.guild.id);
    if (!myChannel) return interaction.reply({ embeds: [error(interaction, "You don't own a temp voice channel.")], ephemeral: true });

    const [channelId, data] = myChannel;
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) return interaction.reply({ embeds: [error(interaction, "Your temp channel no longer exists.")], ephemeral: true });

    if (sub === "name") {
      const name = interaction.options.getString("name");
      await channel.setName(name);
      return interaction.reply({ embeds: [success(interaction, `Renamed your channel to **${name}**.`)] });
    }
    if (sub === "limit") {
      await channel.setUserLimit(interaction.options.getInteger("limit"));
      return interaction.reply({ embeds: [success(interaction, `Set user limit to **${interaction.options.getInteger("limit") || "unlimited"}**.`)] });
    }
    if (sub === "lock") {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
      return interaction.reply({ embeds: [success(interaction, "Locked your voice channel.")] });
    }
    if (sub === "unlock") {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
      return interaction.reply({ embeds: [success(interaction, "Unlocked your voice channel.")] });
    }
    if (sub === "permit") {
      const user = interaction.options.getUser("user");
      await channel.permissionOverwrites.edit(user, { Connect: true });
      return interaction.reply({ embeds: [success(interaction, `Permitted **${user.username}** to join your channel.`)] });
    }
    if (sub === "kick") {
      const target = interaction.options.getMember("user");
      if (target?.voice.channel?.id === channelId) await target.voice.disconnect();
      return interaction.reply({ embeds: [success(interaction, `Kicked **${interaction.options.getUser("user").username}** from your channel.`)] });
    }
    if (sub === "transfer") {
      const user = interaction.options.getUser("user");
      const target = interaction.guild.members.cache.get(user.id);
      if (!target?.voice.channel || target.voice.channel.id !== channelId)
        return interaction.reply({ embeds: [error(interaction, "That user must be in your channel.")], ephemeral: true });
      tempChannels[channelId].ownerId = user.id;
      saveTempChannels(tempChannels);
      return interaction.reply({ embeds: [success(interaction, `Transferred ownership to **${user.username}**.`)] });
    }
  },
};
