const { SlashCommandBuilder } = require("discord.js");
const { base, error } = require("../../utils/embed");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get current weather for a city")
    .addStringOption(o => o.setName("city").setDescription("City name").setRequired(true)),

  async execute(interaction) {
    const city = interaction.options.getString("city");
    await interaction.deferReply();

    try {
      const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
        timeout: 8000,
        headers: { "User-Agent": "Luna-Discord-Bot/1.0" },
      });

      const current  = data.current_condition?.[0];
      const area     = data.nearest_area?.[0];
      if (!current || !area) return interaction.editReply({ embeds: [error(interaction, "City not found.")] });

      const areaName  = area.areaName?.[0]?.value ?? city;
      const country   = area.country?.[0]?.value ?? "";
      const tempC     = current.temp_C;
      const tempF     = current.temp_F;
      const feels     = current.FeelsLikeC;
      const humidity  = current.humidity;
      const windKmph  = current.windspeedKmph;
      const desc      = current.weatherDesc?.[0]?.value ?? "Unknown";
      const visibility = current.visibility;

      const ICONS = {
        "Sunny": "☀️", "Clear": "🌙", "Partly cloudy": "⛅", "Cloudy": "☁️",
        "Overcast": "☁️", "Mist": "🌫️", "Fog": "🌫️", "Light rain": "🌦️",
        "Moderate rain": "🌧️", "Heavy rain": "🌧️", "Snow": "❄️",
        "Thundery": "⛈️", "Blizzard": "🌨️", "Sleet": "🌨️",
      };
      const icon = Object.entries(ICONS).find(([k]) => desc.includes(k))?.[1] ?? "🌡️";

      return interaction.editReply({
        embeds: [
          base(interaction)
            .setTitle(`${icon} ${areaName}, ${country}`)
            .setDescription(`**${desc}**`)
            .addFields(
              { name: "🌡️ Temperature", value: `${tempC}°C / ${tempF}°F`,       inline: true },
              { name: "🤔 Feels Like",  value: `${feels}°C`,                     inline: true },
              { name: "💧 Humidity",    value: `${humidity}%`,                   inline: true },
              { name: "💨 Wind",        value: `${windKmph} km/h`,               inline: true },
              { name: "👁️ Visibility",  value: `${visibility} km`,               inline: true },
            )
            .setColor(0x5865f2)
            .setFooter({ text: "Powered by wttr.in" }),
        ],
      });
    } catch {
      return interaction.editReply({ embeds: [error(interaction, "Could not retrieve weather data. Try a different city name.")] });
    }
  },
};
