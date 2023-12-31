import { mediaFromUrl } from "../functions/mediaFromUrl.js";
import ytSearch from "yt-search";
import youtubedl from "youtube-dl-exec";

export default {
  name: "video",
  description: "Descarga videos de Youtube.",
  alias: ["v", "vid"],
  use: "!video 'nombre o url'",

  run: async (socket, msg, args) => {
    try {
      const query = args.join(" ");

      if (!query) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa el nombre o URL del vídeo.",
        });
        return;
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const video = (await ytSearch(query)).all.find((i) => i.type === "video");

      if (!video) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Sin resultados disponibles.",
        });

        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      const { formats } = await youtubedl(video.url, {
        dumpSingleJson: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
      });

      const results = formats.filter((x) => {
        return x.vcodec !== "none" && x.acodec !== "none";
      });

      if (!results.length) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Vídeo no disponible para su descargar.",
        });

        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      const media = await mediaFromUrl(results[results.length - 1].url);

      if (media === "limit exceeded") {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "No pude enviar el video ya que este supera el limite del peso permitido.",
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        video: media.data,
        mimetype: "video/mp4",
      });

      media.data = null;

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "¡Ups! Acaba de suceder un error inesperado.",
      });
    }
  },
};
