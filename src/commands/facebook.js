import { mediaFromUrl } from "../functions/mediaFromUrl.js";
import facebook from "@xaviabot/fb-downloader";

export default {
  name: "facebook",
  description: "Descarga videos de facebook.",
  alias: ["fb"],
  use: "!facebook 'url'",

  run: async (socket, msg, args) => {
    try {
      const url = args.join(" ");

      if (!url) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa una URL de un video de facebook.",
        });

        return;
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const { hd, sd } = await facebook(url);

      const video = await mediaFromUrl(hd || sd);

      if (video === "limit exceeded") {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "No pude enviar el video ya que este supera el limite del peso permitido.",
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        video: video.data,
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      if (error?.includes("Please enter the valid Facebook URL")) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Asegurate de que sea una URL de facebook válida.",
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      if (error?.includes("Unable to fetch video information")) {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "El video no existe o es privado.",
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
