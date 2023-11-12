import { exec } from "child_process";

export default function () {
  exec("npm install", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar npm install: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`npm install generó errores: ${stderr}`);
      return;
    }

    console.log(`Instalación exitosa. Salida: ${stdout}`);
  });

  process.on("uncaughtException", (error) => console.error(error));

  process.on("uncaughtExceptionMonitor", (error) => console.error(error));

  process.on("unhandledRejection", (error) => console.error(error));

  process.stdin.resume();
}
