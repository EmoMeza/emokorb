import Usuario from "../models/usuario.model.js";

export const getUsuarios = async (req, res) => {
  const usuarios = await Usuario.find().select("-password");
  res.json(usuarios);
};

export const getUsuario = async (req, res) => {
  const usuario = await Usuario.findById(req.params.id).select("-password");
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(usuario);
};

export const crearUsuario = async (req, res) => {
  const { email, username, nombre, apellido, password, role } = req.body;

  if (!email || !username || !nombre || !apellido || !password) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  const existe = await Usuario.findOne({ $or: [{ email }, { username }] });
  if (existe) return res.status(409).json({ message: "Email o username ya registrado" });

  const usuario = await Usuario.create({ email, username, nombre, apellido, password, role });
  res.status(201).json(usuario);
};

export const editarUsuario = async (req, res) => {
  const { password, ...campos } = req.body;

  const usuario = await Usuario.findByIdAndUpdate(req.params.id, campos, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(usuario);
};

export const cambiarPasswordUsuario = async (req, res) => {
  const { passwordNueva } = req.body;
  if (!passwordNueva) return res.status(400).json({ message: "Nueva contraseña requerida" });

  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

  usuario.password = passwordNueva;
  await usuario.save();
  res.json({ message: "Contraseña actualizada" });
};

export const eliminarUsuario = async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json({ message: "Usuario eliminado" });
};
