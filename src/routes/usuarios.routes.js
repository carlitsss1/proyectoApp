import { Router } from "express";
import { clientesEstadisticas, 
    actualizarPerfil, 
    cambiarPassword} 
    from "../controladores/usuariosCtrl.js";
import { enviarCodigo } from "../controladores/recuperacionCtrl.js";

const router = Router();

router.get('/clientes-estadisticas', clientesEstadisticas);
router.put('/actualizar', actualizarPerfil);
router.put('/cambiar-password', cambiarPassword);
router.post("/recuperar", enviarCodigo);

export default router;