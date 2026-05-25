import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.model.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = await Usuario.findById(payload.id).select("-password");
    if (!req.usuario) return res.status(401).json({ message: "Usuario no encontrado" });
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario?.role)) {
    return res.status(403).json({ message: "Sin permisos suficientes" });
  }
  next();
};
