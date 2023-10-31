import { TiktokDL } from "@tobyg74/tiktok-api-dl";

export default {
  name: "tiktok",
  alias: ["tt"],
  cooldown: 10000,

  // Función principal del comando
  run: async (socket, msg, args) => {

    // Obtiene la URL proporcionada como argumento
    const url = args.join(" ");

    // Verifica si se proporciona la url del tiktok
    if (!url) {
        socket.sendMessage(msg.messages[0]?.key.remoteJid, { text: "Ingresa la url del tiktok."  });
        return;
    }
      
    const regex = /^(https?:\/\/)?(www\.|vm\.)?tiktok\.com\/[@a-zA-Z0-9_.~=\/-?]+/i;

    if (!regex.test(url)) {
        return await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Envia una url de tiktok valida.",
        });
    }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      try {
        const { result } = await TiktokDL(url, { version: "v1" });
        
        if(result.type === "video") {
        
          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          video: { url: result.video[0] } ,
        });
        
        } else if(result.type === "image") {
            for (const enlace of result.images) {
              socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          image: { url: enlace } ,
        });
          }
        }
      
        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
      
      } catch(err) {
        console.log(err)
        
        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: "¡Ups! Sucedió un error.",
      });
      }
  },
};
