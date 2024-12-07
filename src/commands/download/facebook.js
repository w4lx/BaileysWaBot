import { mediaFromUrl } from "../../functions/mediaFromUrl.js";
import { fbdown } from "btch-downloader";

export default {
  name: "facebook",
  description: "Descarga videos de facebook.",
  alias: ["fb"],
  use: "!facebook 'url'",

  run: async (socket, msg, args) => {
    if (!args.length) {
      return socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Ingresa una URL de un video de facebook.",
      });
    }

    try {
      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const { Normal_video, HD } = await fbdown(args[0]);

      if (!Normal_video || !HD) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "No hay videos disponibles.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      const video = await mediaFromUrl(HD || Normal_video);

      if (video === "limit exceeded") {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "No pude enviar el video ya que este supera el limite del peso permitido.",
        });

        return socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        video: video.data,
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Error desconocido.",
      });

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
