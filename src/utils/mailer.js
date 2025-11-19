import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_KEY;

export const enviarCorreo = async (destino, codigo) => {
  const api = new SibApiV3Sdk.TransactionalEmailsApi();

  await api.sendTransacEmail({
    sender: { email: "cuentadecarlitos1@gmail.com", name: "ProyectoApp" },
    to: [{ email: destino }],
    subject: "Código de recuperación",
    htmlContent: `
      <h2>Recuperación de contraseña</h2>
      <p>Tu contraseña temporal es:</p>
      <h1 style="letter-spacing:4px;">${codigo}</h1>
      <p>Ingresa a la app y cámbiala desde tu perfil.</p>
    `,
  });
};