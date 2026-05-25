import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  requireListaAccess,
  requireOwner,
  requireListaActiva,
} from "../middlewares/lista.middleware.js";
import {
  getListas,
  crearLista,
  getLista,
  editarLista,
  eliminarLista,
  agregarColaborador,
  quitarColaborador,
  subirBoleta,
  descargarBoleta,
} from "../controllers/lista.controller.js";
import {
  agregarProducto,
  editarProducto,
  eliminarProducto,
} from "../controllers/producto.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.get("/", getListas);
router.post("/", crearLista);

router.get("/:id", requireListaAccess, getLista);
router.patch("/:id", requireListaAccess, requireListaActiva, editarLista);
router.delete("/:id", requireListaAccess, requireOwner, eliminarLista);

router.post("/:id/colaboradores/:uid", requireListaAccess, requireOwner, agregarColaborador);
router.delete("/:id/colaboradores/:uid", requireListaAccess, requireOwner, quitarColaborador);

router.get("/:id/boleta", requireListaAccess, descargarBoleta);
router.post("/:id/boleta", requireListaAccess, requireOwner, upload.single("boleta"), subirBoleta);

router.post("/:id/productos", requireListaAccess, requireListaActiva, agregarProducto);
router.patch("/:id/productos/:pid", requireListaAccess, requireListaActiva, editarProducto);
router.delete("/:id/productos/:pid", requireListaAccess, requireListaActiva, eliminarProducto);

export default router;
