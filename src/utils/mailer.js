import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cuentadecarlitos1@gmail.com",
    pass: "uvfv umgv rtcs ezgl", 
  },
});