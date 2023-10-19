import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker } from "wa-sticker-formatter";

export default {
  name: "sticker",

  // Función principal del comando
  run: async (socket, msg, args) => {
    // Descarga el mensaje multimedia recibido como datos binarios
    const data = await downloadMediaMessage(msg.messages[0], "buffer");

    // Crea un objeto de sticker con los datos multimedia y opciones personalizadas
    const createSticker = new Sticker(data, {
      author: msg.messages[0]?.pushName, // Nombre del autor del sticker (si está disponible)
      pack: "Sticker", // Nombre del paquete de stickers
      quality: 50, // Calidad del sticker (rango: 0-100)
      type: "full", // Tipo de sticker ("full" para stickers completos)
    });

    // Convierte el sticker en un mensaje compatible para enviar en WhatsApp
    const sticker = await createSticker.toMessage();

    // Imprime el mensaje del sticker en la consola (opcional)
    console.log(sticker);

    // Envía el sticker como un mensaje a través del socket de WhatsApp
    socket.sendMessage(msg.messages[0]?.key.remoteJid, sticker);
  },
};
