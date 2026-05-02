module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`[luna] Logged in as ${client.user.tag}`);
    console.log(`[luna] Serving ${client.guilds.cache.size} guild(s)`);
    client.user.setPresence({
      activities: [{ name: "/help", type: 2 }],
      status: "online",
    });
  },
};
