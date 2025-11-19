import nodemailer from "nodemailer";
import config from "config";

export const sendEmail = async (to, subject, text) => {
   const transporter = nodemailer.createTransport({
      host: config.get("email.smtp.host"),
      port: config.get("email.smtp.port"),
      secure: config.get("email.smtp.secure"),
      auth: {
        user: config.get("email.smtp.user"),
        pass: config.get("email.smtp.password"),
      },
    });

    const mailOptions = {
      from: config.get("email.from"),
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
  
};
