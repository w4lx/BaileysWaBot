import tiktok from "@tobyg74/tiktok-api-dl";
import { mediaFromUrl } from "../../functions/mediaFromUrl.js";

export default {
  name: "tiktok",
  description: "Descarga videos de TikTok sin marca de agua.",
  alias: ["tt"],
  use: "!tiktok 'url'",

  run: async (socket, msg, args) => {
    try {
      const url = args.join("");

      if (!url) {
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Ingrese la URl del vídeo de TikTok que deseas descargar.",
        });
      }

      const regexp =
        /^(https?:\/\/)?(www\.|vm\.)?tiktok\.com\/[@a-zA-Z0-9_.~=\/-?]+/i;

      if (!regexp.test(url)) {
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "URL inválida.",
        });
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const { status, result } = await tiktok.Downloader(url, {
        version: "v3",
      });

      if (status !== "success") {
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Ha ocurrido un error, vuelve a intentarlo.",
        });
      }

      await new Promise(async (resolve, reject) => {
        if (result.type === "image") {
          result.images.map((img) => {
            socket.sendMessage(msg.messages[0]?.key.remoteJid, {
              image: { url: img },
            });
          });

          resolve(true);
        } else if (result.type === "video") {
          const media = await mediaFromUrl(result.video1);

          if (media === "limit exceeded") {
            await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
              text: "No pude enviar el video ya que este supera el limite del peso permitido.",
            });

            return socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
              react: { text: "❌", key: msg.messages[0]?.key },
            });
          }

          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            video: media.data,
            mimetype: "video/mp4",
          });

          media.data = null;

          resolve(true);
        }
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.log(error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "Sucedió un error inesperado.",
      });
    }
  },
};
