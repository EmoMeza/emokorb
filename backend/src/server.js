import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initGridFS } from "./config/gridfs.js";
import { seedAdmin } from "./config/seed.js";
import { initIO } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initIO(httpServer);

connectDB().then(() => {
  initGridFS();
  seedAdmin();
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
