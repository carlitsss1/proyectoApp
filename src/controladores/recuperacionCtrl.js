import { pool } from '../../db.js';
import { enviarCorreo } from "../utils/mailer.js";
import { createHash } from 'crypto';

function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const enviarCodigo = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Correo no registrado" });
    }

    const codigo = generarCodigo();

    const hashTemp = createHash('sha256')
      .update(codigo)
      .digest('hex');

    await pool.query(
      "UPDATE usuarios SET password_hash = ?, requiere_cambio = 1 WHERE email = ?",
      [hashTemp, email]
    );

    await enviarCorreo(email, codigo);

    res.json({ message: "Código enviado al correo." });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};
