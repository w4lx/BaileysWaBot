import axios from "axios";

export default {
  name: "clima",
  description: "Obtén el clima actual de tu ciudad o país.",
  alias: ["tiempo"],
  use: "!cliema 'ciudad o país'",

  run: async (socket, msg, args) => {
    const city = args.join(" ");

    if (!city) {
      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        text: `*Escriba el nombre de pais o ciudad*`,
      });

      return;
    }

    try {
      const desc = {
        "clear sky": "Cielo despejado",
        "few clouds": "Pocas nubes",
        "scattered clouds": "Nubes dispersas",
        "broken clouds": "Nubosidad fragmentada",
        "overcast clouds": "Cielo nublado",
        "light rain": "Lluvia ligera",
        "moderate rain": "Lluvia moderada",
        "heavy rain": "Lluvia intensa",
        "shower rain": "Chubascos",
      };

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`
      );
      const res = response.data;
      const name = res.name;
      const Country = res.sys.country;
      const Weather =
        desc[res.weather[0].description] || res.weather[0].description;
      const Temperature = res.main.temp + "°C";
      const Minimum_Temperature = res.main.temp_min + "°C";
      const Maximum_Temperature = res.main.temp_max + "°C";
      const Humidity = res.main.humidity + "%";
      const Wind = res.wind.speed + "m/s";
      const wea = `「 📍 」𝙻𝚄𝙶𝙰𝚁: ${name}\n「 🗺️ 」𝙿𝙰𝙸𝚂: ${Country}\n「 🌤️ 」𝚃𝙸𝙴𝙼𝙿𝙾: ${Weather}\n「 🌡️ 」𝚃𝙴𝙼𝙿𝙴𝚁𝙰𝚃𝚄𝚁𝙰: ${Temperature}\n「 💠 」 𝚃𝙴𝙼𝙿𝙴𝚁𝙰𝚃𝚄𝚁𝙰 𝙼𝙸𝙽𝙸𝙼𝙰: ${Minimum_Temperature}\n「 📛 」 𝚃𝙴𝙼𝙿𝙴𝚁𝙰𝚃𝚄𝚁𝙰 𝙼𝙰𝚇𝙸𝙼𝙰: ${Maximum_Temperature}\n「 💦 」𝙷𝚄𝙼𝙴𝙳𝙰𝙳: ${Humidity}\n「 🌬️ 」 𝚅𝙸𝙴𝙽𝚃𝙾: ${Wind}`;

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, { text: wea });
    } catch (e) {
      console.error(e);

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        text: `*No se han encontrado resultados, corrobore quw haya escrito correctamente su país o ciudad*`,
      });
    }
  },
};
