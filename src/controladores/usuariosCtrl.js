import { pool } from "../../db.js";
import { createHash } from "crypto";

export const clientesEstadisticas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id_usuario,
             u.nombre,
             u.email,
             u.telefono,
             u.direccion,
             COUNT(p.id_pedido) AS total_pedidos,
             IFNULL(SUM(p.total), 0) AS total_gastado
      FROM usuarios u
      LEFT JOIN pedidos p ON p.id_usuario = u.id_usuario
      WHERE u.id_rol = 2
      GROUP BY u.id_usuario
      ORDER BY u.nombre
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error clientesEstadisticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas de clientes" });
  }
};
export const actualizarPerfil = async (req, res) => {
  const { id_usuario, nombre, email, telefono, direccion } = req.body;

  try {
    await pool.query(
      `UPDATE usuarios 
       SET nombre = ?, email = ?, telefono = ?, direccion = ?
       WHERE id_usuario = ?`,
      [nombre, email, telefono, direccion, id_usuario]
    );

    res.json({ status: 'success', message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar perfil' });
  }
};
export const cambiarPassword = async (req, res) => {
  const { id_usuario, nueva } = req.body;

  if (!id_usuario || !nueva) {
    return res.status(400).json({
      status: "error",
      message: "Datos incompletos"
    });
  }

  try {
    // Hash nueva contraseña
    const hashNueva = createHash("sha256").update(nueva).digest("hex");

    // Actualizar contraseña y quitar requiere_cambio
    await pool.query(
      "UPDATE usuarios SET password_hash = ?, requiere_cambio = 0 WHERE id_usuario = ?",
      [hashNueva, id_usuario]
    );

    return res.json({
      status: "success",
      message: "Contraseña cambiada correctamente"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error en el servidor"
    });
  }
};
