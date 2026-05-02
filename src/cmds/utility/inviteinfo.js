const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inviteinfo")
    .setDescription("Get information about an invite code")
    .addStringOption(o => o.setName("code").setDescription("Invite code or URL").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const raw = interaction.options.getString("code").replace(/https?:\/\/discord\.gg\//i, "").split("/").pop();
    try {
      const invite = await interaction.client.fetchInvite(raw);
      const embed = base(interaction)
        .setTitle("Invite Info")
        .setThumbnail(invite.guild?.iconURL({ dynamic: true }) ?? null)
        .addFields(
          { name: "Server", value: invite.guild?.name ?? "Unknown", inline: true },
          { name: "Inviter", value: invite.inviter?.tag ?? "Unknown", inline: true },
          { name: "Channel", value: invite.channel?.name ?? "Unknown", inline: true },
          { name: "Uses", value: `${invite.uses ?? 0}${invite.maxUses ? ` / ${invite.maxUses}` : ""}`, inline: true },
          { name: "Expires", value: invite.expiresAt ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:R>` : "Never", inline: true },
          { name: "Members", value: `${invite.presenceCount ?? "?"} online / ${invite.memberCount ?? "?"} total`, inline: true },
        );
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [error(interaction, "Invalid or expired invite code.")] });
    }
  },
};
