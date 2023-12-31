import wiki from "wikipedia";

export default {
  name: "wikipedia",
  description: "Busca en Wikipedia.",
  alias: ["wiki", "w"],
  use: "!wikipedia 'búsqueda'",

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

      const { summary } = await wiki.page(article);
      const { title, extract } = await summary();

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        text: `*${title}*\n\n${extract}`,
      });
    } catch (error) {
      console.error(error);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "Artículo no encontrado.",
      });
    }
  },
};
