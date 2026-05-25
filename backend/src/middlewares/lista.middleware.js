import Lista from "../models/lista.model.js";

export const requireListaAccess = async (req, res, next) => {
  const lista = await Lista.findById(req.params.id);
  if (!lista) return res.status(404).json({ message: "Lista no encontrada" });

  const userId = req.usuario._id.toString();
  const tieneAcceso =
    lista.owner.toString() === userId ||
    lista.colaboradores.some((c) => c.toString() === userId);

  if (!tieneAcceso) return res.status(403).json({ message: "Sin acceso a esta lista" });

  req.lista = lista;
  next();
};

export const requireOwner = (req, res, next) => {
  if (req.lista.owner.toString() !== req.usuario._id.toString()) {
    return res.status(403).json({ message: "Solo el dueño puede realizar esta acción" });
  }
  next();
};

export const requireListaActiva = (req, res, next) => {
  if (req.lista.estado === "finalizado") {
    return res.status(400).json({ message: "La lista está finalizada y no puede modificarse" });
  }
  next();
};
