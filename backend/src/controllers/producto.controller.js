import { getIO } from "../socket.js";

export const agregarProducto = async (req, res) => {
  const { nombre, precioUnitario, cantidad } = req.body;
  if (!nombre) return res.status(400).json({ message: "El nombre es requerido" });

  const producto = { nombre, precioUnitario: precioUnitario ?? 0, cantidad: cantidad ?? 0 };
  req.lista.productos.push(producto);
  await req.lista.save();

  const nuevo = req.lista.productos.at(-1);
  getIO().to(req.lista._id.toString()).emit("producto:agregado", { listaId: req.lista._id, producto: nuevo });
  res.status(201).json(nuevo);
};

export const editarProducto = async (req, res) => {
  const producto = req.lista.productos.id(req.params.pid);
  if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

  const { nombre, precioUnitario, cantidad } = req.body;
  if (nombre !== undefined) producto.nombre = nombre;
  if (precioUnitario !== undefined) producto.precioUnitario = precioUnitario;
  if (cantidad !== undefined) producto.cantidad = cantidad;

  await req.lista.save();

  getIO().to(req.lista._id.toString()).emit("producto:editado", { listaId: req.lista._id, producto });
  res.json(producto);
};

export const eliminarProducto = async (req, res) => {
  const producto = req.lista.productos.id(req.params.pid);
  if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

  const pid = producto._id;
  producto.deleteOne();
  await req.lista.save();

  getIO().to(req.lista._id.toString()).emit("producto:eliminado", { listaId: req.lista._id, pid });
  res.json({ message: "Producto eliminado" });
};
