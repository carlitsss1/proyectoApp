import express from 'express';
import {
  productosMasVendidos,
  ventasDelMes,
  obtenerEstadosPedidos
} from '../controladores/reportesCtrl.js';

export const router = express.Router();

router.get('/ventas-mes', ventasDelMes);
router.get('/productos-vendidos', productosMasVendidos);
router.get('/estados-pedidos', obtenerEstadosPedidos);
