import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import listaRoutes from "./routes/lista.routes.js";

const app = express();

const corsOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/listas", listaRoutes);

export default app;
