const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View a user's avatar")
    .addUserOption(o => o.setName("user").setDescription("User to get the avatar of")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);
    const serverAvatar = member?.displayAvatarURL({ dynamic: true, size: 4096 });
    const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = base(interaction)
      .setTitle(`${user.username}'s avatar`)
      .setImage(serverAvatar ?? globalAvatar)
      .setURL(serverAvatar ?? globalAvatar);

    if (serverAvatar && serverAvatar !== globalAvatar) {
      embed.setDescription(`[Server Avatar](${serverAvatar}) • [Global Avatar](${globalAvatar})`);
    } else {
      embed.setDescription(`[Open in browser](${globalAvatar})`);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
