import { pool } from '../../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ==============================
// 📁 CONFIGURAR SUBIDA DE IMÁGENES
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nombre = Date.now() + path.extname(file.originalname);
    cb(null, nombre);
  },
});

export const upload = multer({ storage });

// ==============================
// 📋 LISTAR PRODUCTOS
// ==============================
export const listarProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre_categoria
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// ➕ CREAR PRODUCTO NUEVO
// ==============================
export const crearProducto = async (req, res) => {
  try {
    // ✅ body llega en texto plano desde form-data
    const body = req.body || {};

    const nombre = body.nombre;
    const precio = parseFloat(body.precio);
    const cantidad_stock = parseInt(body.cantidad_stock);
    const id_categoria = parseInt(body.id_categoria);
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nombre || isNaN(precio) || isNaN(id_categoria)) {
      return res.status(400).json({ message: '❌ Faltan datos obligatorios o son inválidos.' });
    }

    await pool.query(
      `INSERT INTO productos (nombre, precio, cantidad_stock, id_categoria, foto_url)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, precio, cantidad_stock || 0, id_categoria, foto_url]
    );

    res.json({ status: 'success', message: '✅ Producto agregado correctamente' });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ message: 'Error al crear producto', error: err.message });
  }
};


// ==============================
// ✏️ ACTUALIZAR PRODUCTO
// ==============================
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, cantidad_stock, id_categoria, activo } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

    let query = `
      UPDATE productos SET nombre=?, precio=?, cantidad_stock=?, id_categoria=?, activo=?`;
    const params = [nombre, precio, cantidad_stock, id_categoria, activo];

    if (foto_url) {
      query += `, foto_url=?`;
      params.push(foto_url);
    }

    query += ` WHERE id_producto=?`;
    params.push(id);

    await pool.query(query, params);
    res.json({ status: 'success', message: '✅ Producto actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto', error: err.message });
  }
};

// ==============================
// ❌ ELIMINAR PRODUCTO
// ==============================
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM productos WHERE id_producto = ?`, [id]);
    res.json({ status: 'success', message: '🗑️ Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto', error: err.message });
  }
};
