const { PermissionFlagsBits, ChannelType } = require("discord.js");
const { getGuildConfig, getTempChannels, saveTempChannels } = require("../utils/database");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    const guild = newState.guild ?? oldState.guild;
    if (!guild) return;

    const cfg = getGuildConfig(guild.id);
    if (!cfg.vmJoinChannel) return;

    const tempChannels = getTempChannels();

    // User joined the "Join to Create" channel
    if (newState.channelId === cfg.vmJoinChannel && newState.member) {
      try {
        const category = guild.channels.cache.get(cfg.vmCategory);
        const ch = await guild.channels.create({
          name: `${newState.member.user.username}'s Channel`,
          type: ChannelType.GuildVoice,
          parent: category?.id ?? null,
          userLimit: 0,
          permissionOverwrites: [
            { id: newState.member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers] },
          ],
        });

        await newState.member.voice.setChannel(ch);
        tempChannels[ch.id] = { ownerId: newState.member.id, guildId: guild.id };
        saveTempChannels(tempChannels);
      } catch (err) {
        console.error("[voicemaster] Failed to create temp channel:", err.message);
      }
    }

    // User left a temp channel
    if (oldState.channelId && tempChannels[oldState.channelId]) {
      const ch = guild.channels.cache.get(oldState.channelId);
      if (ch && ch.members.size === 0) {
        try {
          await ch.delete("Temp channel empty");
          delete tempChannels[oldState.channelId];
          saveTempChannels(tempChannels);
        } catch {}
      }
    }
  },
};
