const { cmd } = require('../command');
const axios = require('axios');
const { readEnv } = require('../lib/database'); // 🧠 database එකෙන් variable ගන්න

cmd({
    pattern: "weather",
    alias: ["temp", "forecast", "climate"],
    desc: "Get current weather info by city name",
    category: "tools",
    react: "🌦️",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("🌍 Please enter a city name.\n\nExample: `.weather Colombo`");

        // 🧠 Read environment from database (auto sync)
        const config = await readEnv();

        // 🌐 API URL & Key (editable from DB)
        const API_URL = config.WEATHER_API_URL || "https://api.openweathermap.org/data/2.5/weather";
        const API_KEY = config.WEATHER_API_KEY || "b6907d289e10d714a6e88b30761fae22";

        const url = `${API_URL}?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric`;

        const { data } = await axios.get(url);

        const weather = data.weather[0];
        const main = data.main;

        const icons = {
            Thunderstorm: "⛈️",
            Drizzle: "🌦️",
            Rain: "🌧️",
            Snow: "❄️",
            Clear: "☀️",
            Clouds: "☁️",
            Mist: "🌫️",
            Smoke: "💨",
            Haze: "🌁",
            Dust: "🌪️",
            Fog: "🌫️",
            Sand: "🏜️",
            Ash: "🌋",
            Squall: "🌬️",
            Tornado: "🌪️"
        };

        const icon = icons[weather.main] || "🌤️";

        const msg = `🌦️ *Weather Report for ${data.name}, ${data.sys.country}*\n\n` +
                    `${icon} *Condition:* ${weather.description}\n` +
                    `🌡️ *Temperature:* ${main.temp} °C\n` +
                    `🥵 *Feels Like:* ${main.feels_like} °C\n` +
                    `💧 *Humidity:* ${main.humidity}%\n` +
                    `🌬️ *Wind Speed:* ${data.wind.speed} m/s\n` +
                    `🕓 *Timezone:* UTC ${data.timezone / 3600 >= 0 ? '+' : ''}${data.timezone / 3600}`;

        await react("✅");
        await reply(msg);

    } catch (e) {
        console.error("Weather Plugin Error:", e);
        await react("⚠️");
        reply("⚠️ Couldn't fetch weather data. Check your API or city name.");
    }
});
