import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  precioUnitario: { type: Number, default: 0, min: 0 },
  cantidad: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0 },
});

const listaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    colaboradores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
    productos: [productoSchema],
    estado: { type: String, enum: ["activo", "finalizado"], default: "activo" },
    total: { type: Number, default: 0 },
    boleta: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

listaSchema.pre("save", function () {
  this.productos.forEach((p) => {
    p.total = p.precioUnitario * p.cantidad;
  });
  this.total = this.productos.reduce((sum, p) => sum + p.total, 0);
});

export default mongoose.model("Lista", listaSchema);
