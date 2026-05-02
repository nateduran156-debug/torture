const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

const LOGO = "https://www.image2url.com/r2/default/images/1777748724530-45bd53e9-a976-4009-a959-94a305cbe010.jpeg";

function base(interaction) {
  return new EmbedBuilder()
    .setColor(config.colors.default)
    .setTimestamp()
    .setFooter({
      text: interaction?.user?.username ?? "luna",
      iconURL: LOGO,
    });
}

function success(interaction, description) {
  return base(interaction)
    .setColor(config.colors.success)
    .setDescription(`${config.emojis.success} ${description}`);
}

function error(interaction, description) {
  return base(interaction)
    .setColor(config.colors.error)
    .setDescription(`${config.emojis.error} ${description}`);
}

function warning(interaction, description) {
  return base(interaction)
    .setColor(config.colors.warning)
    .setDescription(`${config.emojis.warning} ${description}`);
}

function info(interaction, title, description, fields = []) {
  const e = base(interaction).setColor(config.colors.info);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (fields.length) e.addFields(fields);
  return e;
}

function noPerms(interaction, permission) {
  return error(interaction, `You don't have permission to use this command${permission ? ` (\`${permission}\`)` : ""}.`);
}

function botNoPerms(interaction, permission) {
  return error(interaction, `I don't have the required permissions${permission ? ` (\`${permission}\`)` : ""} to do that.`);
}

module.exports = { base, success, error, warning, info, noPerms, botNoPerms, LOGO };
