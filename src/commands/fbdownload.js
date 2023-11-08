import facebook from "@xaviabot/fb-downloader";

export default {
  name: "facebook",
  alias: ["fb"],

  run: async (socket, msg, args) => {
    try {
      const url = args.join(" ");

      if (!url) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa una URL de un video de facebook.",
        });
        return;
      }

      const regexp = /^(https?:\/\/)?(www\.)?facebook.com\/[a-zA-Z0-9(\.\?)?]/;

      if (!regexp) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Asegurate de que sea una URL de facebook válida.",
        });
        return;
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const { hd, sd } = await facebook(url);

      const video = hd ? { url: hd } : { url: sd };

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        video: video,
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      if (error?.includes("Unable to fetch video information")) {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "El video no existe o es privado.",
        });

        return;
      }

      if (error?.message?.includes("no space left on device")) {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "No pude enviar el video ya que este supera el limite del peso permitido.",
        });

        return;
      }

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
