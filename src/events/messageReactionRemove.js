const { getReactionRoles } = require("../utils/database");

module.exports = {
  name: "messageReactionRemove",
  async execute(reaction, user) {
    if (user.bot) return;
    if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }

    const guild = reaction.message.guild;
    if (!guild) return;

    const rr = getReactionRoles(guild.id);
    const msgRoles = rr[reaction.message.id];
    if (!msgRoles) return;

    const roleId = msgRoles[reaction.emoji.name] ?? msgRoles[reaction.emoji.toString()];
    if (!roleId) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (member) await member.roles.remove(roleId).catch(() => {});
  },
};
