import { pool } from '../../db.js';

// 📋 Listar cuentas bancarias activas
export const listarCuentas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_cuenta, banco, numero_cuenta, titular, tipo_cuenta, activa
      FROM cuentas_bancarias
      WHERE activa = 1
      ORDER BY id_cuenta DESC
    `);

    // ⚠️ Importante: siempre devolver un array
    res.json(rows || []);
  } catch (err) {
    console.error('❌ Error al listar cuentas bancarias:', err);
    res.status(500).json({
      message: 'Error al listar cuentas bancarias',
      error: err.message,
    });
  }
};

// ➕ Crear cuenta bancaria
export const crearCuenta = async (req, res) => {
  try {
    const { banco, numero_cuenta, titular, tipo_cuenta } = req.body;

    if (!banco || !numero_cuenta || !titular) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    await pool.query(
      `INSERT INTO cuentas_bancarias (banco, numero_cuenta, titular, tipo_cuenta, activa)
       VALUES (?, ?, ?, ?, 1)`,
      [banco, numero_cuenta, titular, tipo_cuenta]
    );

    res.status(201).json({ message: 'Cuenta bancaria creada correctamente' });
  } catch (err) {
    console.error('❌ Error al crear cuenta bancaria:', err);
    res.status(500).json({ message: 'Error al crear cuenta', error: err.message });
  }
};

// ✏️ Editar cuenta bancaria
export const actualizarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { banco, numero_cuenta, titular, tipo_cuenta } = req.body;

    console.log('🛠️ Datos recibidos para actualizar:', req.body);

    if (!id || !banco || !numero_cuenta || !titular || !tipo_cuenta) {
      return res.status(400).json({ message: 'Datos incompletos para actualizar' });
    }

    const [result] = await pool.query(
      `UPDATE cuentas_bancarias 
       SET banco = ?, numero_cuenta = ?, titular = ?, tipo_cuenta = ?
       WHERE id_cuenta = ?`,
      [banco, numero_cuenta, titular, tipo_cuenta, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Cuenta no encontrada' });

    res.json({ message: 'Cuenta actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar cuenta bancaria:', err);
    res.status(500).json({
      message: 'Error al actualizar cuenta',
      error: err.message,
    });
  }
};


// 🗑️ Eliminar cuenta bancaria
export const eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM cuentas_bancarias WHERE id_cuenta = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Cuenta no encontrada' });

    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar cuenta bancaria:', err);
    res.status(500).json({ message: 'Error al eliminar cuenta', error: err.message });
  }
};
