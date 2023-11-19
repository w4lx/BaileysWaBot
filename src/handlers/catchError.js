export default function () {
  process.on("uncaughtException", (error) => console.error(error));

  process.on("uncaughtExceptionMonitor", (error) => console.error(error));

  process.on("unhandledRejection", (error) => console.error(error));

  process.stdin.resume();
}
