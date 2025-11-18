import { pool } from '../../db.js';
import { transporter } from "../utils/mailer.js";
import { createHash } from 'crypto';  // <<--- ESTA LÍNEA ES OBLIGATORIA

// Función para generar código temporal
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const enviarCodigo = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Verificar si el correo existe
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Correo no registrado" });
    }

    // 2. Generar código temporal
    const codigo = generarCodigo();

    // 3. Hashear la contraseña temporal correctamente
    const hashTemp = createHash('sha256')
      .update(codigo)
      .digest('hex');

    await pool.query(
      "UPDATE usuarios SET password_hash = ?, requiere_cambio = 1 WHERE email = ?",
      [hashTemp, email]
    );

    // 4. Enviar correo
    await transporter.sendMail({
      from: `ProyectoApp <cuentadecarlitos1@gmail.com>`,
      to: email,
      subject: "Código para recuperar tu contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Has solicitado recuperar tu acceso.</p>
        <p>Tu contraseña temporal es:</p>
        <h1 style="letter-spacing: 4px;">${codigo}</h1>
        <p>Úsala para ingresar y luego cámbiala desde tu perfil.</p>
        <br>
        <small>ProyectoApp - Sistema automático de recuperación</small>
      `,
    });

    res.json({ message: "Código enviado al correo." });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};
