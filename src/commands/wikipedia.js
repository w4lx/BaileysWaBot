import wiki from "wikipedia";

export default {
  name: "wikipedia",
  alias: ["wiki", "w"],

  run: async (socket, msg, args) => {
    try {
      const article = args.join(" ");

      if (!article) {
        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: `¿Que artículo deseas buscar?`,
        });

        return;
      }

      wiki.setLang("es");

      const page = await (await wiki.page(article)).summary();

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        text: `*${page.title}*\n\n${page.extract}`,
      });
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "Artículo no encontrado.",
      });
    }
  },
};
