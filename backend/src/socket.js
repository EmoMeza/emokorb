import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Usuario from "./models/usuario.model.js";
import Lista from "./models/lista.model.js";

let io;

export const initIO = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token requerido"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.usuario = await Usuario.findById(payload.id).select("-password");
      if (!socket.usuario) return next(new Error("Usuario no encontrado"));
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("lista:join", async (listaId) => {
      const lista = await Lista.findById(listaId);
      if (!lista) return;

      const userId = socket.usuario._id.toString();
      const tieneAcceso =
        lista.owner.toString() === userId ||
        lista.colaboradores.some((c) => c.toString() === userId);

      if (tieneAcceso) socket.join(listaId);
    });

    socket.on("lista:leave", (listaId) => {
      socket.leave(listaId);
    });
  });

  return io;
};

export const getIO = () => io;
