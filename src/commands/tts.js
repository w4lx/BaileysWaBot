import { getAudioBuffer } from "simple-tts-mp3";

export default {
  name: "tts",
  description: "Convierte texto a voz.",
  alias: [],
  use: "!tts 'texto'",

  run: async (socket, msg, args) => {
    try {
      const content = args.join(" ");

      if (!content) {
        socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa un texto para convertir a voz.",
        });

        return;
      }

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const tts = await getAudioBuffer(content, "es");

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        audio: tts,
        mimetype: "audio/mp4",
      });

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Ha ocurrido un error inesperado.",
      });

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
