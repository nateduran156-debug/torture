const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display information about a user")
    .addUserOption(o => o.setName("user").setDescription("User to get info on")),

  async execute(interaction) {
    const user = await (interaction.options.getUser("user") ?? interaction.user).fetch();
    const member = interaction.guild?.members.cache.get(user.id);

    const embed = base(interaction)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: "ID", value: user.id, inline: true },
        { name: "Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
      );

    if (member) {
      embed.addFields(
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: "Nickname", value: member.nickname ?? "None", inline: true },
        { name: "Highest Role", value: `${member.roles.highest}`, inline: true },
      );

      const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id);
      if (roles.size) embed.addFields({ name: `Roles (${roles.size})`, value: roles.map(r => `${r}`).slice(0, 20).join(" ") || "None" });
    }

    if (user.banner) embed.setImage(user.bannerURL({ dynamic: true, size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  },
};
