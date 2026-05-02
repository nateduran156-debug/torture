const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { success, error, noPerms, botNoPerms } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk delete messages from a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName("amount").setDescription("Number of messages to delete (1-100)").setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName("user").setDescription("Only delete messages from this user"))
    .addStringOption(o => o.setName("filter").setDescription("Filter: bots | links | images | embeds | humans"))
    .addStringOption(o => o.setName("keyword").setDescription("Only delete messages containing this keyword")),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({ embeds: [noPerms(interaction, "Manage Messages")], ephemeral: true });
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages))
      return interaction.reply({ embeds: [botNoPerms(interaction, "Manage Messages")], ephemeral: true });

    const amount  = interaction.options.getInteger("amount");
    const filterUser = interaction.options.getUser("user");
    const filter  = interaction.options.getString("filter")?.toLowerCase();
    const keyword = interaction.options.getString("keyword")?.toLowerCase();

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });
      messages = messages.filter(m => {
        if (Date.now() - m.createdTimestamp > 14 * 24 * 60 * 60 * 1000) return false;
        if (filterUser && m.author.id !== filterUser.id) return false;
        if (filter === "bots"   && !m.author.bot) return false;
        if (filter === "humans" && m.author.bot)  return false;
        if (filter === "links"  && !/https?:\/\//.test(m.content)) return false;
        if (filter === "images" && !m.attachments.size && !m.embeds.find(e => e.image)) return false;
        if (filter === "embeds" && !m.embeds.length) return false;
        if (keyword && !m.content.toLowerCase().includes(keyword)) return false;
        return true;
      });

      messages = [...messages.values()].slice(0, amount);
      const deleted = await interaction.channel.bulkDelete(messages, true);
      await interaction.editReply({ embeds: [success(interaction, `Deleted **${deleted.size}** message(s)${keyword ? ` containing \`${keyword}\`` : ""}.`)] });
    } catch {
      await interaction.editReply({ embeds: [error(interaction, "Failed to delete messages. Messages older than 14 days cannot be bulk deleted.")] });
    }
  },
};
