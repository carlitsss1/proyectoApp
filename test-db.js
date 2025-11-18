import { pool } from './db.js';

try {
  const [rows] = await pool.query('SELECT * FROM usuarios');
  console.log('✅ Conexión exitosa. Usuarios encontrados:', rows.length);
  console.log(rows);
} catch (err) {
  console.error('❌ Error al conectar con Railway:', err.message);
}
