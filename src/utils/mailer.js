import Brevo from "sib-api-v3-sdk";

const client = Brevo.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_KEY;

export const enviarCorreo = async (destino, codigo) => {
  try {
    const api = new Brevo.TransactionalEmailsApi();

    await api.sendTransacEmail({
      sender: {
        email: "cuentadecarlitos1@gmail.com",
        name: "ProyectoApp"
      },
      to: [{ email: destino }],
      subject: "Código de recuperación",
      htmlContent: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu contraseña temporal es:</p>
        <h1 style="letter-spacing:4px;">${codigo}</h1>
        <p>Ingresa a la app y cámbiala desde tu perfil.</p>
      `
    });

    console.log("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar correo Brevo:", error);
  }
};
