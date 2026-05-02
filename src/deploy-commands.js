require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

function collectCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCommands(full);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const command = require(full);
      if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`[deploy] Queued: ${command.data.name}`);
      }
    }
  }
}

collectCommands(path.join(__dirname, "commands"));

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (!clientId) {
      console.error("[error] CLIENT_ID not set in .env");
      process.exit(1);
    }

    if (guildId) {
      console.log(`[deploy] Deploying ${commands.length} commands to guild ${guildId} (instant)...`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log("[deploy] Guild commands deployed!");
    } else {
      console.log(`[deploy] Deploying ${commands.length} commands globally (may take up to 1 hour)...`);
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("[deploy] Global commands deployed!");
    }
  } catch (err) {
    console.error("[error] Deployment failed:", err);
  }
})();
