export default {
  name: "help",

  run: (socket, msg, args) => {
    const commands = socket.commands.map((c) => c.name).join("\n");

    socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
      text: `*Mis comandos:*\n\n${commands}`,
    });
  },
};
