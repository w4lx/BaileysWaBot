import { mediaFromUrl } from "../functions/mediaFromUrl.js";
import igdl from "@sasmeee/igdl";

export default {
  name: "instagram",
  description: "Descarga videos e imágenes de Instagram.",
  alias: ["ig", "igdl"],
  use: "!instagram 'url'",

  run: async (socket, msg, args) => {
    try {
      const url = args.join(" ");
      const regexp = /^(https?:\/\/(www\.)?instagram\.com)/;

      if (!url || !regexp.test(url)) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa una url válida de instagram.",
        });

        return;
      }

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const request = await igdl(url);

      for (const value of request) {
        const response = await mediaFromUrl(value.download_link);

        if (response === "limit exceeded") {
          socket.sendMessage(msg.messages[0].key.remoteJid, {
            text: "Archivo muy pesado, no es posible enviar.",
          });
        } else {
          await socket.sendMessage(msg.messages[0].key.remoteJid, {
            [response.mimetype.split("/")[0] || "document"]: response.data,
          });
        }
      }

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
