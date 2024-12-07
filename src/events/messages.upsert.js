export default {
  name: "messages.upsert",

  async load(msg, socket) {
    if (msg.type !== "notify" || !msg.messages?.[0]?.message) return;

    // Comenta esta línea si quieres que el bot procese también sus propios mensajes.
    if (msg.messages[0]?.key.fromMe) return;

    const { message, key } = msg.messages[0];

    const content =
      message?.extendedTextMessage?.text ||
      message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      message?.conversation ||
      message?.imageMessage?.caption ||
      message?.videoMessage?.caption;

    if (!content || !content?.startsWith("!")) return;

    try {
      const args = content.slice(1).trim().split(" ");
      const action = args.shift().toLowerCase();

      const command = socket.commands.find(({ name, alias }) => {
        return name === action || alias?.includes(action);
      });

      if (!command) return;

      await command.run(socket, msg, args);
    } catch (error) {
      console.error(error);

      socket.sendMessage(key.remoteJid, {
        text: "¡Ups! Algo salió mal, inténtalo de nuevo.",
      });
    }
  },
};
