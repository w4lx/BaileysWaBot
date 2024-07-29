import ytSearch from "yt-search";
import ytdl from "@distube/ytdl-core";

export default {
  name: "play",
  description: "Descarga canciones de Youtube.",
  alias: ["p"],
  use: "!play 'nombre o url'",

  run: async (socket, msg, args) => {
    const name = args.join(" ");

    if (!name) {
      return socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Ingresa el nombre de la canción.",
      });
    }

    const response = await ytSearch(name)?.catch(() => null);

    if (!response) {
      return socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Sin resultados.",
      });
    }

    const video = response.videos[0];

    const track = ytdl(video.url, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    track.on("error", () => track.destroy());

    try {
      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0].key },
      });

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        image: { url: video.thumbnail || video.image },
        caption: `*${video.title}*\n\n*Autor:* ${video.author?.name}\n*Duración:* ${video.timestamp}\n*Vistas:* ${video.views}`,
      });

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        audio: { stream: track },
        mimetype: "audio/mpeg",
      });

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "✅", key: msg.messages[0].key },
      });
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "¡Ups! Sucedió un error.",
      });

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "❌", key: msg.messages[0].key },
      });

      track.destroy();
    }
  },
};
