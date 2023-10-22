import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker } from "wa-sticker-formatter";

export default {
  name: "sticker",
  alias: ["pegatina", "s"],

  // Función principal del comando
  run: async (socket, msg, args) => {
    if (!msg.messages[0].message) return;

    // Mandamos el mensaje de espera
    const message = await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
      text: "Generando el sticker...",
    });

    try {
      // Descarga el mensaje multimedia recibido como datos binarios
      const data = await downloadMediaMessage(msg.messages[0], "buffer");

      if (!data) return;
      // Crea un objeto de sticker con los datos multimedia y opciones personalizadas
      const createSticker = new Sticker(data, {
        author: msg.messages[0]?.pushName, // Nombre del autor del sticker (si está disponible)
        pack: "Sticker", // Nombre del paquete de stickers
        quality: 50, // Calidad del sticker (rango: 0-100)
        type: "full", // Tipo de sticker ("full" para stickers completos)
      });

      // Convierte el sticker en un mensaje compatible para enviar en WhatsApp
      const sticker = await createSticker.toMessage();

      // Envía el sticker como un mensaje a través del socket de WhatsApp
      await socket.sendMessage(msg.messages[0]?.key.remoteJid, sticker);

      // Editamos el mensaje de espera
      socket.sendMessage(message?.key.remoteJid, {
        text: "Listo.",
        edit: message?.key,
      });
    } catch (error) {
      console.error(error?.stack || error);

      socket.sendMessage(message?.key.remoteJid, {
        text: "Sucedió un error al generar el sticker, inténtalo de nuevo.",
        edit: message?.key,
      });
    }
  },
};
