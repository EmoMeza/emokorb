import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Backend test working");
});

export default router;