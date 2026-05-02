const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const roasts = [
  "I'd roast you, but my parents told me not to burn trash.",
  "You're the human version of a participation trophy.",
  "I've seen people like you before, but I had to pay an admission.",
  "You're not stupid; you just have bad luck thinking.",
  "If laughter is the best medicine, your face must be curing the world.",
  "I could eat alphabet soup and spit out a better argument than you.",
  "You're the reason they put instructions on shampoo.",
  "Your secrets are always safe with me. I never even listen when you tell me them.",
  "I'd agree with you but then we'd both be wrong.",
  "You bring everyone a lot of joy when you leave the room.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Roast a user")
    .addUserOption(o => o.setName("user").setDescription("User to roast").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const roast = roasts[Math.floor(Math.random() * roasts.length)];

    const embed = base(interaction)
      .setTitle(`🔥 Roasting ${user.username}`)
      .setDescription(roast)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed] });
  },
};
