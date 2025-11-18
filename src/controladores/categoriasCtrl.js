import { pool } from '../../db.js';

// 📋 Listar todas las categorías
export const listarCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY id_categoria');
    res.json(rows);
  } catch (err) {
    console.error('Error al listar categorías:', err);
    res.status(500).json({ message: 'Error al listar categorías', error: err.message });
  }
};

// ➕ Crear nueva categoría
export const crearCategoria = async (req, res) => {
  try {
    const { nombre_categoria, descripcion } = req.body;

    if (!nombre_categoria)
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });

    // ✅ Aquí agregamos la descripción
    await pool.query(
      'INSERT INTO categorias (nombre_categoria, descripcion) VALUES (?, ?)',
      [nombre_categoria, descripcion || null]
    );

    res.json({ status: 'success', message: 'Categoría agregada correctamente ✅' });
  } catch (err) {
    console.error('Error al crear categoría:', err);
    res.status(500).json({ message: 'Error al crear categoría', error: err.message });
  }
};


// ✏️ Actualizar categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria, descripcion } = req.body;

    if (!nombre_categoria)
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });

    await pool.query(
      'UPDATE categorias SET nombre_categoria = ?, descripcion = ? WHERE id_categoria = ?',
      [nombre_categoria, descripcion || null, id]
    );

    res.json({ status: 'success', message: 'Categoría actualizada correctamente ✅' });
  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    res.status(500).json({ message: 'Error al actualizar categoría', error: err.message });
  }
};

// ❌ Eliminar categoría
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
    res.json({ status: 'success', message: 'Categoría eliminada correctamente 🗑️' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ message: 'Error al eliminar categoría', error: err.message });
  }
};
