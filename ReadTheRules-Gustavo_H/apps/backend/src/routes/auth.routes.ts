import { Router } from "express";
import { loginCotroller, registerController } from "../controllers/auth.controller.js";
import { validar } from "../middlewares/validar.js";
import { loginSchema, registerSchema } from "../schemas.js";

const router = Router();

router.post("/register", validar(registerSchema), registerController)
router.post("/login", validar(loginSchema), loginCotroller)

export default router;
