import Lista from "../models/lista.model.js";
import Usuario from "../models/usuario.model.js";
import { getIO } from "../socket.js";
import { getBucket } from "../config/gridfs.js";

export const getListas = async (req, res) => {
  const listas = await Lista.find({
    $or: [{ owner: req.usuario._id }, { colaboradores: req.usuario._id }],
  }).populate("owner colaboradores", "username nombre apellido");

  res.json(listas);
};

export const crearLista = async (req, res) => {
  const { nombre, productos } = req.body;
  if (!nombre) return res.status(400).json({ message: "El nombre es requerido" });

  const lista = await Lista.create({
    nombre,
    owner: req.usuario._id,
    productos: productos ?? [],
  });

  await Usuario.findByIdAndUpdate(req.usuario._id, { $push: { listas: lista._id } });

  res.status(201).json(lista);
};

export const getLista = async (req, res) => {
  await req.lista.populate("owner colaboradores", "username nombre apellido");
  res.json(req.lista);
};

export const editarLista = async (req, res) => {
  const { nombre, estado } = req.body;
  const campos = {};
  if (nombre) campos.nombre = nombre;
  if (estado) {
    campos.estado = estado;
    campos.fechaCierre = estado === "finalizado" ? new Date() : null;
  }

  Object.assign(req.lista, campos);
  await req.lista.save();

  getIO().to(req.lista._id.toString()).emit("lista:actualizada", req.lista);
  res.json(req.lista);
};

export const eliminarLista = async (req, res) => {
  await Lista.findByIdAndDelete(req.lista._id);
  await Usuario.updateMany({ listas: req.lista._id }, { $pull: { listas: req.lista._id } });
  res.json({ message: "Lista eliminada" });
};

export const agregarColaborador = async (req, res) => {
  const { uid } = req.params;
  const lista = req.lista;

  const esAmigo = req.usuario.amigos.some((a) => a.toString() === uid);
  if (!esAmigo) return res.status(400).json({ message: "Solo puedes agregar amigos como colaboradores" });

  if (lista.colaboradores.some((c) => c.toString() === uid)) {
    return res.status(409).json({ message: "El usuario ya es colaborador" });
  }

  lista.colaboradores.push(uid);
  await lista.save();
  res.json({ message: "Colaborador agregado" });
};

export const quitarColaborador = async (req, res) => {
  const { uid } = req.params;
  req.lista.colaboradores = req.lista.colaboradores.filter((c) => c.toString() !== uid);
  await req.lista.save();
  res.json({ message: "Colaborador eliminado" });
};

export const subirBoleta = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Archivo requerido" });

  const bucket = getBucket();

  if (req.lista.boleta) {
    try {
      await bucket.delete(req.lista.boleta);
    } catch {
      // el archivo anterior puede no existir, se ignora
    }
  }

  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
    metadata: { listaId: req.lista._id },
  });

  uploadStream.end(req.file.buffer);

  await new Promise((resolve, reject) => {
    uploadStream.on("finish", resolve);
    uploadStream.on("error", reject);
  });

  req.lista.boleta = uploadStream.id;
  await req.lista.save();

  res.json({ message: "Boleta subida", boletaId: uploadStream.id });
};

export const descargarBoleta = async (req, res) => {
  if (!req.lista.boleta) return res.status(404).json({ message: "Sin boleta" });

  const bucket = getBucket();
  const cursor = bucket.find({ _id: req.lista.boleta });
  const [file] = await cursor.toArray();
  if (!file) return res.status(404).json({ message: "Archivo no encontrado" });

  res.set("Content-Type", file.contentType);
  bucket.openDownloadStream(req.lista.boleta).pipe(res);
};
