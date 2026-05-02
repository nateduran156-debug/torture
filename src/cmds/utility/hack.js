const { SlashCommandBuilder } = require("discord.js");
const { base } = require("../../utils/embed");

const STEPS = [
  "Initializing rootkit...",
  "Bypassing firewall...",
  "Injecting SQL payload...",
  "Accessing password database...",
  "Cracking encryption (AES-256)...",
  "Decrypting credentials...",
  "Uploading payload to server...",
  "Establishing reverse shell...",
  "Extracting personal data...",
  "Wiping logs...",
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hack")
    .setDescription("Fake-hack a user for fun")
    .addUserOption(o => o.setName("target").setDescription("User to hack").setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser("target");

    const embed = base(interaction)
      .setTitle("💻 Hacking...")
      .setDescription(`**Target:** ${target.tag}\n\n\`\`\`diff\n- Initiating...\n\`\`\``)
      .setColor(0x00ff41);

    await interaction.reply({ embeds: [embed] });

    for (let i = 0; i < STEPS.length; i++) {
      await sleep(600);
      const done    = STEPS.slice(0, i + 1).map(s => `+ ${s}`).join("\n");
      const current = i + 1 < STEPS.length ? `\n- ${STEPS[i + 1]}` : "";
      embed.setDescription(`**Target:** ${target.tag}\n\n\`\`\`diff\n${done}${current}\n\`\`\``);
      await interaction.editReply({ embeds: [embed] }).catch(() => {});
    }

    await sleep(700);
    const ip   = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");
    const pass = Array.from({ length: 12 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    const card = `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`;

    embed
      .setTitle("💻 Hack Complete")
      .setDescription(
        `**Target:** ${target.tag}\n\n` +
        `\`\`\`diff\n${STEPS.map(s => `+ ${s}`).join("\n")}\n+ Done!\n\`\`\`\n\n` +
        `**IP Address:** \`${ip}\`\n` +
        `**Password:** \`${pass}\`\n` +
        `**Card:** \`${card}\`\n` +
        `-# (This is a joke command — no actual hacking happened.)`
      )
      .setColor(0x00ff41);

    await interaction.editReply({ embeds: [embed] }).catch(() => {});
  },
};
