export default {
  name: "soldier",
  alias: [],

  run: (socket, msg, args) => {
    const percentage = Math.floor(Math.random() * 101);

    const { message, key } = msg.messages[0];

    const mention = message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mention || mention <= 0) {
      socket.sendMessage(
        key?.remoteJid,
        {
          text: `Eres *${percentage}%* soldier.`,
        },
        { quoted: msg.messages[0] }
      );

      return;
    }

    socket.sendMessage(
      key?.remoteJid,
      {
        text: `@${mention[0].replace(
          "@s.whatsapp.net",
          ""
        )} es *${percentage}%* soldier.`,
        mentions: [mention[0]],
      },
      { quoted: msg.messages[0] }
    );
  },
};
