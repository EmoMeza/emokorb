import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  getUsuarios,
  getUsuario,
  crearUsuario,
  editarUsuario,
  cambiarPasswordUsuario,
  eliminarUsuario,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(requireAuth, requireRole("administrador"));

router.get("/usuarios", getUsuarios);
router.post("/usuarios", crearUsuario);
router.get("/usuarios/:id", getUsuario);
router.patch("/usuarios/:id", editarUsuario);
router.patch("/usuarios/:id/password", cambiarPasswordUsuario);
router.delete("/usuarios/:id", eliminarUsuario);

export default router;
