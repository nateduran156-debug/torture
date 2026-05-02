const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const NUMBER_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption(o => o.setName("question").setDescription("The poll question").setRequired(true))
    .addStringOption(o => o.setName("options").setDescription("Options separated by | (max 10). Leave empty for yes/no poll")),

  async execute(interaction) {
    const question = interaction.options.getString("question");
    const raw = interaction.options.getString("options");
    const options = raw ? raw.split("|").map(o => o.trim()).filter(Boolean).slice(0, 10) : null;

    const embed = base(interaction)
      .setTitle("📊 " + question)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    if (options && options.length >= 2) {
      embed.setDescription(options.map((o, i) => `${NUMBER_EMOJIS[i]} ${o}`).join("\n"));
    } else {
      embed.setDescription("React with 👍 or 👎");
    }

    await interaction.reply({ embeds: [embed] });
    const msg = await interaction.fetchReply();

    if (options && options.length >= 2) {
      for (let i = 0; i < options.length; i++) await msg.react(NUMBER_EMOJIS[i]);
    } else {
      await msg.react("👍");
      await msg.react("👎");
    }
  },
};
