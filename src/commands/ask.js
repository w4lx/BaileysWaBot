import { Hercai } from "hercai";

export default {
  name: "ask",
  description: "Hazle una consulta a ChatGPT.",
  alias: ["gpt", "chatgpt"],
  use: "!ask 'consulta'",

  run: async (socket, msg, args) => {
    try {
      const prompt = args.join(" ") || "Hola";

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "📝", key: msg.messages[0]?.key },
      });

      const response = await new Hercai().question({
        content: prompt,
        model: "v3",
      });

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: response.reply,
      });

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Sucedió un error inesperado.",
      });

      socket.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "", key: msg.messages[0]?.key },
      });
    }
  },
};
