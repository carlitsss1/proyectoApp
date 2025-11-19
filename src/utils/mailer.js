import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "9bf69c001@smtp-brevo.com",
    pass: process.env.BREVO_SMTP_KEY,
  },
});
