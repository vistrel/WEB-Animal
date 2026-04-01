const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");

const server = app.listen(env.PORT, () => {
  console.log(`Сервер запущено на http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`Отримано сигнал ${signal}. Завершення роботи...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
