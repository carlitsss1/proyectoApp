import { pool } from '../../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ===============================================
// ✅ Crear pedido
// ===============================================
export const crearPedido = async (req, res) => {
  const { id_usuario, carrito, total, direccion_envio, observaciones, latitud, longitud } = req.body;

  if (!id_usuario || !carrito || carrito.length === 0) {
    return res.status(400).json({ message: 'Datos del pedido incompletos.' });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [pedidoRes] = await conn.query(
      `INSERT INTO pedidos (
        id_usuario,
        fecha_pedido,
        estado,
        total,
        direccion_envio,
        observaciones,
        latitud,
        longitud,
        codigo_envio,
        notificado
      ) VALUES (?, NOW(), 'pendiente', ?, ?, ?, ?, ?, NULL, 0)`,
      [
        id_usuario,
        total,
        direccion_envio || null,
        observaciones || null,
        latitud || null,
        longitud || null
      ]
    );

    const id_pedido = pedidoRes.insertId;

    for (const item of carrito) {
      const subtotal = item.cantidad * item.precio;

      await conn.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unit, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_pedido, item.id_producto, item.cantidad, item.precio, subtotal]
      );

      await conn.query(
        `UPDATE productos
         SET cantidad_stock = cantidad_stock - ?
         WHERE id_producto = ? AND cantidad_stock >= ?`,
        [item.cantidad, item.id_producto, item.cantidad]
      );
    }

    await conn.query(
      `INSERT INTO pagos (id_pedido, monto, fecha_pago, estado_pago)
       VALUES (?, ?, NOW(), 'pendiente')`,
      [id_pedido, total]
    );

    await conn.commit();

    res.json({
      status: 'success',
      message: 'Pedido registrado correctamente 🚀',
      id_pedido,
    });

  } catch (error) {
    await conn.rollback();
    console.error('❌ Error al crear pedido:', error);
    res.status(500).json({ message: 'Error al registrar pedido' });
  } finally {
    conn.release();
  }
};



// ===============================================
// 📋 Pedidos del usuario
// ===============================================
export const listarPedidosUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id_pedido, fecha_pedido, estado, total, comprobante_url, latitud, longitud, codigo_envio, notificado
       FROM pedidos
       WHERE id_usuario = ?
       ORDER BY fecha_pedido DESC`,
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error en listarPedidosUsuario:', error);
    res.status(500).json({ message: 'Error al obtener pedidos', error });
  }
};



// ===============================================
// 🟩 Listar todos los pedidos (ADMIN)
// ===============================================
export const listarTodosPedidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_pedido,
        p.fecha_pedido,
        p.estado,
        p.total,
        p.direccion_envio,
        p.observaciones,
        p.latitud,
        p.longitud,
        p.codigo_envio,
        u.nombre AS nombre_usuario,
        pa.baucher_url AS comprobante_url,
        pa.estado_pago
      FROM pedidos p
      INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN pagos pa ON pa.id_pedido = p.id_pedido
      ORDER BY p.fecha_pedido DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('❌ Error en listarTodosPedidos:', error);
    res.status(500).json({ message: 'Error al obtener pedidos', error });
  }
};



// ===============================================
// 🟨 Actualizar estado del pedido (AQUÍ SE ARREGLA)
// ===============================================
export const actualizarEstadoPedido = async (req, res) => {
  const { id_pedido } = req.params;
  const { estado } = req.body;

  try {
    const estadosMap = {
      pendiente: { pedido: 'pendiente', pago: 'pendiente' },
      pagado: { pedido: 'pagado', pago: 'verificado' },
      cancelado: { pedido: 'cancelado', pago: 'rechazado' },
      enviado: { pedido: 'enviado', pago: 'verificado' },
      entregado: { pedido: 'entregado', pago: 'verificado' },
    };

    const estadoPedido = estadosMap[estado]?.pedido || 'pendiente';
    const estadoPago = estadosMap[estado]?.pago || 'pendiente';

    // 🔥🔥🔥 AQUÍ ESTA EL CAMBIO: notificado = 0
    const [resPedido] = await pool.query(
      `UPDATE pedidos SET estado = ?, notificado = 0 WHERE id_pedido = ?`,
      [estadoPedido, id_pedido]
    );

    await pool.query(
      `UPDATE pagos SET estado_pago = ? WHERE id_pedido = ?`,
      [estadoPago, id_pedido]
    );

    if (resPedido.affectedRows === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado ❌' });
    }

    res.json({
      status: 'success',
      message: `Estado actualizado correctamente ✅`,
      pedido_estado: estadoPedido,
      pago_estado: estadoPago,
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar estado', error });
  }
};



// ===============================================
// 🧾 Subir comprobante
// ===============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/bauchers';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const uploadBaucher = multer({ storage }).single('comprobante');

export const subirComprobante = async (req, res) => {
  const { id_pedido } = req.params;
  if (!req.file) return res.status(400).json({ message: 'No se envió ningún archivo.' });

  const ruta = `/uploads/bauchers/${req.file.filename}`;

  try {
    await pool.query(`UPDATE pedidos SET comprobante_url = ? WHERE id_pedido = ?`, [ruta, id_pedido]);
    res.json({ message: 'Comprobante subido correctamente ✅', comprobante_url: ruta });
  } catch (error) {
    console.error('❌ Error al subir comprobante:', error);
    res.status(500).json({ message: 'Error al subir comprobante', error });
  }
};



// ===============================================
// 🚚 Actualizar código de envío
// ===============================================
export const actualizarCodigoEnvio = async (req, res) => {
  const { id_pedido } = req.params;
  const { codigo_envio } = req.body;

  try {
    await pool.query(
      `UPDATE pedidos SET codigo_envio = ? WHERE id_pedido = ?`,
      [codigo_envio, id_pedido]
    );

    res.json({
      status: 'success',
      message: 'Código de envío actualizado correctamente 🚚📦',
      codigo_envio
    });

  } catch (error) {
    console.error('❌ Error al actualizar código de envío:', error);
    res.status(500).json({ message: 'Error al actualizar código de envío' });
  }
};



// ===============================================
// 🟦 Obtener un pedido por ID
// ===============================================
export const obtenerPedidoPorId = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        p.*,
        u.nombre AS nombre_usuario,
        pa.estado_pago,
        pa.baucher_url
      FROM pedidos p
      INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN pagos pa ON pa.id_pedido = p.id_pedido
      WHERE p.id_pedido = ?
      LIMIT 1`,
      [id_pedido]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("❌ ERROR obtenerPedidoPorId:", error);
    res.status(500).json({ message: "Error obteniendo pedido" });
  }
};



// ===============================================
// 🟪 Marcar pedido como notificado (cliente lo vio)
// ===============================================
export const marcarPedidoNotificado = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    await pool.query(
      `UPDATE pedidos SET notificado = 1 WHERE id_pedido = ?`,
      [id_pedido]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error marcando pedido como notificado:", error);
    res.status(500).json({ error: "Error marcando como notificado" });
  }
};
export const filtrarPedidosPorFecha = async (req, res) => {
  const { id_usuario } = req.params;
  const { desde, hasta } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT id_pedido, fecha_pedido, estado, total, comprobante_url, latitud, longitud, codigo_envio, notificado
       FROM pedidos
       WHERE id_usuario = ?
       AND DATE(fecha_pedido) BETWEEN ? AND ?
       ORDER BY fecha_pedido DESC`,
      [id_usuario, desde, hasta]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error filtrando pedidos:", error);
    res.status(500).json({ message: "Error al filtrar pedidos" });
  }
};
// ===============================================
// 📦 OBTENER DETALLES DE UN PEDIDO
// ===============================================
export const obtenerDetallesPedido = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
         d.id_detalle,
         d.cantidad,
         d.precio_unit,
         d.subtotal,
         p.nombre AS nombre_producto
       FROM detalle_pedido d
       INNER JOIN productos p ON p.id_producto = d.id_producto
       WHERE d.id_pedido = ?`,
      [id_pedido]
    );

    res.json(rows);

  } catch (error) {
    console.error("❌ Error obteniendo detalles:", error);
    res.status(500).json({ message: "Error obteniendo detalles", error });
  }
};
