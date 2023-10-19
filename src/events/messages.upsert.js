export default {
  name: "messages.upsert",

  load(msg, socket) {
    if (msg.messages[0]?.key.fromMe) return;
    if (msg.type !== "notify") return;

    const content =
      msg.messages[0]?.message?.extendedTextMessage?.text ||
      msg.messages[0]?.message?.ephemeralMessage?.message?.extendedTextMessage
        ?.text ||
      msg.messages[0]?.message?.conversation ||
      msg.messages[0]?.message?.imageMessage?.caption;

    if (!content?.startsWith("!")) return;

    const args = content.slice(1).trim().split(" ");
    const commandName = args.shift()?.toLowerCase();
    const command = socket.commands.find((c) => c.name === commandName);

    if (!command) return;

    command.run(socket, msg, args);
  },
};
