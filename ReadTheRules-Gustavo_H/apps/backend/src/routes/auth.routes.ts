import { Router } from "express";
import { esqueciSenhaController, loginCotroller, redefinirSenhaController, registerController } from "../controllers/auth.controller.js";
import { validar } from "../middlewares/validar.js";
import { esqueciSchema, loginSchema, redefinirSchema, registerSchema } from "../schemas.js";

const router = Router();

router.post("/register", validar(registerSchema), registerController)
router.post("/login", validar(loginSchema), loginCotroller)
router.post("/esqueci-senha", validar(esqueciSchema), esqueciSenhaController)
router.post("/redefinir-senha", validar(redefinirSchema), redefinirSenhaController)

export default router;
