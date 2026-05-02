const { getGuildConfig } = require("../utils/database");
const { base } = require("../utils/embed");

module.exports = {
  name: "messageDelete",
  async execute(message) {
    if (!message.guild) return;

    if (!message.author?.bot) {
      message.client.snipes = message.client.snipes ?? new Map();
      message.client.snipes.set(message.channel.id, {
        content: message.content,
        author: message.author,
        image: message.attachments.find(a => a.contentType?.startsWith("image/"))?.url ?? null,
        deletedAt: Date.now(),
      });
    }

    // Message delete log
    const cfg = getGuildConfig(message.guild.id);
    const logCh = cfg.logChannels?.messages ? message.guild.channels.cache.get(cfg.logChannels.messages) : null;
    if (!logCh || message.author?.bot) return;

    const embed = base(null)
      .setTitle("Message Deleted")
      .setColor(0xe74c3c)
      .addFields(
        { name: "Author", value: message.author ? `${message.author.tag} (<@${message.author.id}>)` : "Unknown", inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Content", value: message.content?.slice(0, 1024) || "*No content*" },
      )
      .setTimestamp();

    await logCh.send({ embeds: [embed] }).catch(() => {});
  },
};
