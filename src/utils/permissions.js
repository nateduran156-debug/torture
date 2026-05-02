const { PermissionFlagsBits } = require("discord.js");

function memberHierarchyCheck(interaction, target) {
  if (!target.manageable) return `I cannot perform this action on **${target.user.tag}** — they may be above me in the role hierarchy.`;
  if (target.id === interaction.guild.ownerId) return `You cannot perform this action on the server owner.`;
  if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
    return `You cannot perform this action on **${target.user.tag}** — they have an equal or higher role than you.`;
  }
  return null;
}

function parseDuration(str) {
  if (!str) return null;
  const regex = /(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks)/gi;
  let ms = 0;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const val = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("s")) ms += val * 1000;
    else if (unit.startsWith("m")) ms += val * 60 * 1000;
    else if (unit.startsWith("h")) ms += val * 60 * 60 * 1000;
    else if (unit.startsWith("d")) ms += val * 24 * 60 * 60 * 1000;
    else if (unit.startsWith("w")) ms += val * 7 * 24 * 60 * 60 * 1000;
  }
  return ms || null;
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (sec) parts.push(`${sec}s`);
  return parts.join(" ") || "0s";
}

function xpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

module.exports = { memberHierarchyCheck, parseDuration, formatDuration, xpForLevel };
