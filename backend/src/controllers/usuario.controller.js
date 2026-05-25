import Usuario from "../models/usuario.model.js";

export const getMiPerfil = async (req, res) => {
  const usuario = await Usuario.findById(req.usuario._id)
    .populate("amigos", "username nombre apellido email");
  res.json(usuario);
};

export const cambiarMiPassword = async (req, res) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ message: "Contraseña actual y nueva son requeridas" });
  }

  const usuario = await Usuario.findById(req.usuario._id);
  if (!(await usuario.compararPassword(passwordActual))) {
    return res.status(401).json({ message: "Contraseña actual incorrecta" });
  }

  usuario.password = passwordNueva;
  await usuario.save();
  res.json({ message: "Contraseña actualizada" });
};

export const buscarUsuarios = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Parámetro de búsqueda requerido" });

  const usuarios = await Usuario.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
    _id: { $ne: req.usuario._id },
  }).select("username nombre apellido email");

  res.json(usuarios);
};

export const agregarAmigo = async (req, res) => {
  const { id } = req.params;

  if (id === req.usuario._id.toString()) {
    return res.status(400).json({ message: "No puedes agregarte a ti mismo" });
  }

  const amigo = await Usuario.findById(id);
  if (!amigo) return res.status(404).json({ message: "Usuario no encontrado" });

  if (req.usuario.amigos.includes(id)) {
    return res.status(409).json({ message: "Ya es tu amigo" });
  }

  await Usuario.findByIdAndUpdate(req.usuario._id, { $push: { amigos: id } });
  res.json({ message: "Amigo agregado" });
};

export const eliminarAmigo = async (req, res) => {
  const { id } = req.params;

  await Usuario.findByIdAndUpdate(req.usuario._id, { $pull: { amigos: id } });
  res.json({ message: "Amigo eliminado" });
};
