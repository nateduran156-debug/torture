const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const DARES = [
  "Send the last photo in your camera roll.",
  "Let someone else post a status from your account.",
  "Do your best impression of a celebrity.",
  "Speak in an accent for the next 5 minutes.",
  "Sing the first 30 seconds of a random song.",
  "Send a voice message saying something embarrassing.",
  "DM someone you haven't talked to in over a year.",
  "Post a selfie with a funny face.",
  "Write the name of your crush on your forehead.",
  "Let someone else choose your profile picture for 24 hours.",
  "Tell an embarrassing story about yourself.",
  "Do 20 push-ups right now.",
  "Type with your elbows for the next message.",
  "Eat a spoonful of hot sauce.",
  "Call a family member and sing happy birthday (even if it's not their birthday).",
  "Talk in third person for the next 10 minutes.",
  "Change your bio to something embarrassing for an hour.",
  "Put your phone on do not disturb and don't check it for 30 minutes.",
  "Imitate another person in the chat until someone guesses who it is.",
  "Do the worm (or attempt it).",
  "Share a screenshot of your most recent embarrassing text.",
  "Let the chat choose your next profile picture.",
  "Go outside and do a cartwheel.",
  "Eat something with your eyes closed and guess what it is.",
  "Do your best robot dance and record it.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dare")
    .setDescription("Get a random dare"),

  async execute(interaction) {
    const d = DARES[Math.floor(Math.random() * DARES.length)];
    return interaction.reply({
      embeds: [
        base(interaction)
          .setTitle("😈 Dare")
          .setDescription(d)
          .setColor(0xed4245)
          .setFooter({ text: `Dared to ${interaction.user.username}` }),
      ],
    });
  },
};
