import { pool } from '../../db.js';
import crypto from 'crypto';

// =======================
// REGISTRAR USUARIO
// =======================
export const registrar = async (req, res) => {
  const { nombre, email, clave, telefono = null, direccion = null, rol = 2 } = req.body;

  if (!nombre || !email || !clave)
    return res.status(400).json({ status: 'error', message: 'Campos incompletos' });

  const hash = crypto.createHash('sha256').update(clave).digest('hex');

  try {
    const [exist] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?', 
      [email]
    );

    if (exist.length > 0)
      return res.json({ status: 'error', message: 'El correo ya está registrado' });

    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, direccion, id_rol, requiere_cambio)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [nombre, email, hash, telefono, direccion, rol]
    );

    res.json({ status: 'success', message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};


// =======================
// LOGIN DE USUARIO
// =======================
export const login = async (req, res) => {
  const { email, clave } = req.body;

  if (!email || !clave)
    return res.status(400).json({ status: 'error', message: 'Campos vacíos' });

  const hash = crypto.createHash('sha256').update(clave).digest('hex');

  try {
    const [rows] = await pool.query(
      `SELECT 
        id_usuario,
        nombre,
        email,
        telefono,
        direccion,
        id_rol,
        requiere_cambio
       FROM usuarios 
       WHERE email = ? AND password_hash = ?`,
      [email, hash]
    );

    if (rows.length === 0)
      return res.json({ status: 'error', message: 'Credenciales incorrectas' });

    res.json({ status: 'success', usuario: rows[0] });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
