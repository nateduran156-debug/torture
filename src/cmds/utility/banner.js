const { SlashCommandBuilder } = require("discord.js");
const { base, info } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("View a user's profile banner")
    .addUserOption(o => o.setName("user").setDescription("User to get the banner of")),

  async execute(interaction) {
    const user = await (interaction.options.getUser("user") ?? interaction.user).fetch();
    const banner = user.bannerURL({ dynamic: true, size: 4096 });

    if (!banner) return interaction.reply({ embeds: [info(interaction, null, `**${user.username}** has no profile banner.`)] });

    const embed = base(interaction)
      .setTitle(`${user.username}'s banner`)
      .setImage(banner)
      .setURL(banner)
      .setDescription(`[Open in browser](${banner})`);

    await interaction.reply({ embeds: [embed] });
  },
};
