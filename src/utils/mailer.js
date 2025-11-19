import SibApiV3Sdk from "sib-api-v3-sdk";

<<<<<<< HEAD
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
=======
export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "9bf69c001@smtp-brevo.com",
    pass: process.env.BREVO_SMTP_KEY,
  },
});
>>>>>>> 62e802d13fe2e6baf9c77be634ed1569978c9cd4
