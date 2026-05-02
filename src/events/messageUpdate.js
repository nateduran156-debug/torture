const { getGuildConfig } = require("../utils/database");
const { base } = require("../utils/embed");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;
    if (oldMessage.author?.bot) return;

    // Store edit snipe
    newMessage.client.editSnipes = newMessage.client.editSnipes ?? new Map();
    newMessage.client.editSnipes.set(oldMessage.channel.id, {
      before: oldMessage.content,
      after: newMessage.content,
      author: oldMessage.author,
      editedAt: Date.now(),
    });

    // Message edit log
    const cfg = getGuildConfig(oldMessage.guild.id);
    const logCh = cfg.logChannels?.messages ? oldMessage.guild.channels.cache.get(cfg.logChannels.messages) : null;
    if (!logCh) return;

    const embed = base(null)
      .setTitle("Message Edited")
      .setColor(0xf39c12)
      .setURL(newMessage.url)
      .addFields(
        { name: "Author", value: `${oldMessage.author?.tag ?? "Unknown"} (<@${oldMessage.author?.id}>)`, inline: true },
        { name: "Channel", value: `<#${oldMessage.channel.id}>`, inline: true },
        { name: "Before", value: oldMessage.content?.slice(0, 512) || "*No content*" },
        { name: "After", value: newMessage.content?.slice(0, 512) || "*No content*" },
      )
      .setTimestamp();

    await logCh.send({ embeds: [embed] }).catch(() => {});
  },
};
