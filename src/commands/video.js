import youtubeDl from "@distube/ytdl-core";
import ytSearch from "yt-search";

export default {
  name: "video",
  description: "Descarga videos de Youtube.",
  alias: ["v", "vid"],
  use: "!video 'nombre o url'",

  run: async (socket, msg, args) => {
    try {
      const query = args.join(" ");

      if (!query) {
        return socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa el nombre o URL del vídeo.",
        });
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const video = (await ytSearch(query)).all.find((i) => i.type === "video");

      if (!video) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Sin resultados disponibles.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }
      const stream = youtubeDl(video.url, {
        filter: "videoandaudio",
        quality: "highestvideo",
      });

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        document: { stream },
        fileName: video.title,
        mimetype: "video/mp4",
        caption: `Duración > ${video.timestamp}\nVistas > ${video.views}\nAutor > ${video.author.name}`,
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "¡Ups! Acaba de suceder un error inesperado.",
      });

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
