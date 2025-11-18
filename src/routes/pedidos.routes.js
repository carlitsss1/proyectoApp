import express from 'express';
import {
  crearPedido,
  listarPedidosUsuario,
  listarTodosPedidos,
  actualizarEstadoPedido,
  subirComprobante,
  uploadBaucher,
  actualizarCodigoEnvio,
  obtenerPedidoPorId,
  marcarPedidoNotificado,
  filtrarPedidosPorFecha,
  obtenerDetallesPedido
} from '../controladores/pedidosCtrl.js';

export const router = express.Router();

// =======================
// CLIENTE
// =======================
router.post('/', crearPedido);
router.get('/usuario/:id_usuario', listarPedidosUsuario);
router.post('/subir-comprobante/:id_pedido', uploadBaucher, subirComprobante);

// Marcar notificado
router.put('/notificado/:id_pedido', marcarPedidoNotificado);

// Filtrar por fechas
router.get('/usuario/:id_usuario/filtrar', filtrarPedidosPorFecha);

// =======================
// DETALLES DEL PEDIDO
// (IMPORTANTE: ANTES DE /:id_pedido )
// =======================
router.get('/:id_pedido/detalles', obtenerDetallesPedido);


// =======================
// ADMIN
// =======================
router.get('/', listarTodosPedidos);
router.put('/:id_pedido/estado', actualizarEstadoPedido);
router.put('/:id_pedido/codigo-envio', actualizarCodigoEnvio);

// =======================
// OBTENER PEDIDO POR ID
// =======================
router.get('/:id_pedido', obtenerPedidoPorId);
