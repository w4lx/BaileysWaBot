import API from "@mrnima/tiktok-downloader";

export default {
  name: "tiktok",
  description: "Descarga videos de TikTok sin marca de agua.",
  alias: ["tt"],
  use: "!tiktok 'url'",

  run: async (socket, msg, args) => {
    if (!args.length) {
      return socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Ingrese la URL del vídeo de TikTok que deseas descargar.",
      });
    }

    if (!/(?:www|v[mt])\.tiktok\.com/.test(args[0])) {
      return socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "URL inválida.",
      });
    }

    try {
      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const response = await API.downloadTiktok(args[0]);
      const result = response.result.dl_link;

      if (result.images?.length >= 1) {
        for (const url of result.images) {
          await socket.sendMessage(msg.messages[0].key.remoteJid, {
            image: { url },
          });
        }
      } else {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          video: { url: result.download_mp4_1 || result.download_mp4_2 },
        });
      }

      socket.sendMessage(msg.messages[0].key.remoteJid, {
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
