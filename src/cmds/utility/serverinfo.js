const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const verificationLevels = ["None", "Low", "Medium", "High", "Very High"];
const boostTiers = ["None", "Tier 1", "Tier 2", "Tier 3"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Display information about this server"),

  async execute(interaction) {
    const g = interaction.guild;
    await g.fetch();

    const channels = g.channels.cache;
    const text = channels.filter(c => c.type === 0).size;
    const voice = channels.filter(c => c.type === 2).size;
    const categories = channels.filter(c => c.type === 4).size;

    const embed = base(interaction)
      .setTitle(g.name)
      .setThumbnail(g.iconURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: "Owner", value: `<@${g.ownerId}>`, inline: true },
        { name: "Created", value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "Members", value: `**${g.memberCount.toLocaleString()}** total`, inline: true },
        { name: "Channels", value: `${text} text • ${voice} voice • ${categories} categories`, inline: true },
        { name: "Roles", value: `${g.roles.cache.size}`, inline: true },
        { name: "Emojis", value: `${g.emojis.cache.size}`, inline: true },
        { name: "Boosts", value: `${g.premiumSubscriptionCount} boosts (${boostTiers[g.premiumTier]})`, inline: true },
        { name: "Verification", value: verificationLevels[g.verificationLevel], inline: true },
        { name: "ID", value: g.id, inline: true },
      );

    if (g.bannerURL()) embed.setImage(g.bannerURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  },
};
