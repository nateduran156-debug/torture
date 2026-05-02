const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const TRUTHS = [
  "What's the most embarrassing thing you've ever done?",
  "Have you ever lied to your best friend?",
  "What's the biggest secret you're keeping from your parents?",
  "Have you ever cheated on a test?",
  "What's the most childish thing you still do?",
  "Who was your first crush?",
  "Have you ever blamed someone else for something you did?",
  "What's the worst gift you've ever received?",
  "Have you ever pretended to be sick to avoid something?",
  "What's your biggest fear?",
  "Have you ever read someone else's messages without them knowing?",
  "What's the most ridiculous thing you've cried about?",
  "Have you ever stood someone up?",
  "What habit are you most ashamed of?",
  "Have you ever said 'I love you' and not meant it?",
  "What's something you've done that you never told anyone?",
  "Have you ever ghosted someone?",
  "What's the worst date you've ever been on?",
  "Have you ever talked behind a friend's back?",
  "What's the weirdest dream you've ever had?",
  "Have you ever been caught snooping?",
  "What's the most embarrassing thing in your search history?",
  "Have you ever pretended to like a gift?",
  "What's the pettiest reason you've ended a friendship?",
  "Have you ever lied on your resume or profile?",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("truth")
    .setDescription("Get a random truth question"),

  async execute(interaction) {
    const q = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
    return interaction.reply({
      embeds: [
        base(interaction)
          .setTitle("🤔 Truth")
          .setDescription(q)
          .setColor(0x5865f2)
          .setFooter({ text: `Asked by ${interaction.user.username}` }),
      ],
    });
  },
};
