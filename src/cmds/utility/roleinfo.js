const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Display information about a role")
    .addRoleOption(o => o.setName("role").setDescription("Role to get info on").setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id));

    const embed = base(interaction)
      .setTitle(role.name)
      .setColor(role.color || 2829617)
      .addFields(
        { name: "ID", value: role.id, inline: true },
        { name: "Color", value: role.hexColor, inline: true },
        { name: "Position", value: `${role.position}`, inline: true },
        { name: "Members", value: `${members.size}`, inline: true },
        { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
        { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
        { name: "Managed", value: role.managed ? "Yes" : "No", inline: true },
        { name: "Created", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
