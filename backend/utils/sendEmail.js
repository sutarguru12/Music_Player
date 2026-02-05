import nodemailer from "nodemailer";

const sendMail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"MERN Music App" <${process.env.MAILTRAP_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendMail;
