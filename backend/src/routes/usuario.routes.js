import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getMiPerfil,
  cambiarMiPassword,
  buscarUsuarios,
  agregarAmigo,
  eliminarAmigo,
} from "../controllers/usuario.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMiPerfil);
router.patch("/me/password", cambiarMiPassword);
router.get("/buscar", buscarUsuarios);
router.post("/amigos/:id", agregarAmigo);
router.delete("/amigos/:id", eliminarAmigo);

export default router;
