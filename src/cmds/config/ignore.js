const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { base, success, error } = require("../../utils/embed");
const { getIgnore, saveIgnore } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ignore")
    .setDescription("Manage what the bot ignores")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s =>
      s.setName("channel-add")
        .setDescription("Ignore a channel (bot won't respond to prefix commands)")
        .addChannelOption(o => o.setName("channel").setDescription("Channel to ignore").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("channel-remove")
        .setDescription("Un-ignore a channel")
        .addChannelOption(o => o.setName("channel").setDescription("Channel to un-ignore").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("user-add")
        .setDescription("Ignore a user (bot ignores their prefix commands)")
        .addUserOption(o => o.setName("user").setDescription("User to ignore").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("user-remove")
        .setDescription("Un-ignore a user")
        .addUserOption(o => o.setName("user").setDescription("User to un-ignore").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("command-add")
        .setDescription("Disable a command in this server")
        .addStringOption(o => o.setName("command").setDescription("Command name").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("command-remove")
        .setDescription("Re-enable a disabled command")
        .addStringOption(o => o.setName("command").setDescription("Command name").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("bypass-add")
        .setDescription("Allow a role to bypass ignore rules")
        .addRoleOption(o => o.setName("role").setDescription("Role to allow bypass").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("bypass-remove")
        .setDescription("Remove a bypass role")
        .addRoleOption(o => o.setName("role").setDescription("Role to remove").setRequired(true))
    )
    .addSubcommand(s => s.setName("show").setDescription("Show all current ignore rules")),

  async execute(interaction) {
    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const data    = getIgnore(guildId);

    if (sub === "channel-add") {
      const ch = interaction.options.getChannel("channel");
      if (data.channels.includes(ch.id)) return interaction.reply({ embeds: [error(interaction, "That channel is already ignored.")], ephemeral: true });
      data.channels.push(ch.id);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `Now ignoring prefix commands in ${ch}.`)] });
    }

    if (sub === "channel-remove") {
      const ch = interaction.options.getChannel("channel");
      data.channels = data.channels.filter(id => id !== ch.id);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `No longer ignoring ${ch}.`)] });
    }

    if (sub === "user-add") {
      const user = interaction.options.getUser("user");
      if (data.users.includes(user.id)) return interaction.reply({ embeds: [error(interaction, "That user is already ignored.")], ephemeral: true });
      data.users.push(user.id);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `Now ignoring prefix commands from ${user.tag}.`)] });
    }

    if (sub === "user-remove") {
      const user = interaction.options.getUser("user");
      data.users = data.users.filter(id => id !== user.id);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `No longer ignoring ${user.tag}.`)] });
    }

    if (sub === "command-add") {
      const cmd = interaction.options.getString("command").toLowerCase();
      if (data.commands.includes(cmd)) return interaction.reply({ embeds: [error(interaction, `\`${cmd}\` is already disabled.`)], ephemeral: true });
      data.commands.push(cmd);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `Disabled command \`${cmd}\` in this server.`)] });
    }

    if (sub === "command-remove") {
      const cmd = interaction.options.getString("command").toLowerCase();
      data.commands = data.commands.filter(c => c !== cmd);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `Re-enabled command \`${cmd}\`.`)] });
    }

    if (sub === "bypass-add") {
      const role = interaction.options.getRole("role");
      if (data.bypass.includes(role.id)) return interaction.reply({ embeds: [error(interaction, "That role already has bypass.")], ephemeral: true });
      data.bypass.push(role.id);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `${role} can now bypass ignore rules.`)] });
    }

    if (sub === "bypass-remove") {
      const role = interaction.options.getRole("role");
      data.bypass = data.bypass.filter(id => id !== role.id);
      saveIgnore(guildId, data);
      return interaction.reply({ embeds: [success(interaction, `Removed bypass for ${role}.`)] });
    }

    if (sub === "show") {
      const channels  = data.channels.length  ? data.channels.map(id => `<#${id}>`).join(", ")        : "None";
      const users     = data.users.length     ? data.users.map(id => `<@${id}>`).join(", ")           : "None";
      const commands  = data.commands.length  ? data.commands.map(c => `\`${c}\``).join(", ")         : "None";
      const bypasses  = data.bypass.length    ? data.bypass.map(id => `<@&${id}>`).join(", ")         : "None";

      return interaction.reply({
        embeds: [
          base(interaction)
            .setTitle("🚫 Ignore Rules")
            .addFields(
              { name: "Channels",      value: channels, inline: false },
              { name: "Users",         value: users,    inline: false },
              { name: "Commands",      value: commands, inline: false },
              { name: "Bypass Roles",  value: bypasses, inline: false },
            )
            .setColor(0x2b2d31),
        ],
      });
    }
  },
};
