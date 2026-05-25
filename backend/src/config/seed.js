import Usuario from "../models/usuario.model.js";

export const seedAdmin = async () => {
  const existe = await Usuario.findOne({ role: "administrador" });
  if (existe) return;

  await Usuario.create({
    email: "admin@admin.com",
    username: "admin",
    nombre: "Admin",
    apellido: "Sistema",
    password: "admin",
    role: "administrador",
  });

  console.log("Usuario admin creado (user: admin / pass: admin)");
};
