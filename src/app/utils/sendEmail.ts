import nodemailer from 'nodemailer';
import ejs from 'ejs';
import config from '../config';

export const sendEmail = async (to: string, from: string, subject: string, username: string,body:string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.co.uk',
    port: 587,
    secure: false, 
    
    auth: {
      user: 'admin@caretimer.co.uk', 
      pass: 'H3ll0admin!', 
    },

  });

  try {
    const html = await ejs.renderFile(
      __dirname + "/../static/email_template/" + "welcome_template" + ".ejs",
      { name: username, body: body }
    );

    const mailOptions = {
      from, 
      to, 
      subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};