import { pool } from '../../db.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// 📸 Configurar multer para guardar comprobantes en /uploads/bauchers/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/bauchers';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nombre = Date.now() + path.extname(file.originalname);
    cb(null, nombre);
  },
});

export const uploadComprobante = multer({ storage });

// 💾 Crear pago automáticamente al hacer pedido
export const crearPagoAuto = async (req, res) => {
  const { id_pedido, id_cuenta, monto } = req.body;

  if (!id_pedido || !monto) {
    return res.status(400).json({ message: 'Datos del pago incompletos.' });
  }

  try {
    await pool.query(
      `INSERT INTO pagos (id_pedido, id_cuenta, monto, estado_pago, fecha_pago)
       VALUES (?, ?, ?, 'pendiente', NOW())`,
      [id_pedido, id_cuenta || null, monto]
    );

    res.json({ status: 'success', message: 'Pago creado automáticamente ✅' });
  } catch (err) {
    console.error('❌ Error al crear pago:', err);
    res.status(500).json({ status: 'error', message: 'Error al crear pago', error: err.message });
  }
};

// 📤 Subir comprobante
export const subirComprobante = async (req, res) => {
  const { id_pago } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ningún archivo 📎' });
    }

    // Ruta donde se guardó el comprobante
    const baucher_url = `/uploads/bauchers/${req.file.filename}`;

    // Verifica que el pago exista antes de actualizar
    const [existe] = await pool.query('SELECT * FROM pagos WHERE id_pago = ?', [id_pago]);
    if (existe.length === 0) {
      return res.status(404).json({ message: 'Pago no encontrado ❌' });
    }

    // Actualiza el pago con la URL del baucher
    await pool.query(
      `UPDATE pagos 
       SET baucher_url = ?, estado_pago = 'pendiente', fecha_pago = NOW()
       WHERE id_pago = ?`,
      [baucher_url, id_pago]
    );

    console.log('✅ Comprobante subido:', baucher_url);
    res.json({ status: 'success', message: 'Comprobante subido correctamente ✅', baucher_url });

  } catch (err) {
    console.error('❌ Error al subir comprobante:', err);
    res.status(500).json({ message: 'Error interno al subir comprobante', error: err.message });
  }
};


// 👀 Listar todos los pagos (para admin)
export const listarPagos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.banco, c.numero_cuenta, pe.id_usuario, pe.estado AS estado_pedido
      FROM pagos p
      LEFT JOIN cuentas_bancarias c ON p.id_cuenta = c.id_cuenta
      INNER JOIN pedidos pe ON p.id_pedido = pe.id_pedido
      ORDER BY p.fecha_pago DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al listar pagos:', err);
    res.status(500).json({ message: 'Error al listar pagos', error: err.message });
  }
};

// ✏️ Actualizar estado del pago (admin)
export const actualizarEstadoPago = async (req, res) => {
  const { id_pago } = req.params;
  const { estado_pago } = req.body;

  if (!['pendiente', 'verificado', 'rechazado'].includes(estado_pago)) {
    return res.status(400).json({ message: 'Estado de pago inválido.' });
  }

  try {
    await pool.query(`UPDATE pagos SET estado_pago = ? WHERE id_pago = ?`, [estado_pago, id_pago]);
    res.json({ status: 'success', message: `Pago ${estado_pago} correctamente ✅` });
  } catch (err) {
    console.error('Error al actualizar estado del pago:', err);
    res.status(500).json({ message: 'Error al actualizar estado del pago', error: err.message });
  }
};
