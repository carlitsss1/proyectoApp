import express from 'express';
import {
  crearPagoAuto,
  subirComprobante,
  listarPagos,
  actualizarEstadoPago,
  uploadComprobante,
} from '../controladores/pagosCtrl.js';

export const router = express.Router();

router.post('/', crearPagoAuto);
router.get('/', listarPagos);
router.put('/:id_pago', actualizarEstadoPago);
router.post('/subir/:id_pago', uploadComprobante.single('baucher'), subirComprobante);
