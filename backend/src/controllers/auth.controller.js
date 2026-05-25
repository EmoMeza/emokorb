import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.model.js";

const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const registro = async (req, res) => {
  const { email, username, nombre, apellido, password } = req.body;

  if (!email || !username || !nombre || !apellido || !password) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  const existe = await Usuario.findOne({ $or: [{ email }, { username }] });
  if (existe) {
    return res.status(409).json({ message: "Email o username ya registrado" });
  }

  const totalUsuarios = await Usuario.countDocuments();
  if (totalUsuarios >= 10) {
    return res.status(403).json({ message: "El límite de usuarios ha sido alcanzado" });
  }

  const usuario = await Usuario.create({ email, username, nombre, apellido, password });
  res.status(201).json({ token: generarToken(usuario._id), usuario });
};

export const login = async (req, res) => {
  const { identificador, password } = req.body;

  if (!identificador || !password) {
    return res.status(400).json({ message: "Identificador y contraseña requeridos" });
  }

  const usuario = await Usuario.findOne({
    $or: [{ email: identificador }, { username: identificador }],
  });

  if (!usuario || !(await usuario.compararPassword(password))) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  res.json({ token: generarToken(usuario._id), usuario });
};
