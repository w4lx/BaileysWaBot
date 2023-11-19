import { exec } from "child_process";

export function installDependencies() {
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
}
