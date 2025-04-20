const express = require('express');
const nodemailer = require('nodemailer');
const Pdf = require('./../schema/pdf'); // Asegúrate de importar el modelo Pdf

const router = express.Router();

// Configuración de las credenciales de correo
const password = "vaeh gbid lbzu zszu"; // Asegúrate de que esta contraseña sea segura
const correo = "marialuisaalonso850@gmail.com";

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: correo,
    pass: password,
  },
});

// Ruta para enviar el PDF y guardarlo en la base de datos
router.post("/enviar-pdf", async (req, res) => {
  const { pdfBase64, codigoCita } = req.body;

  try {
    // Guardar el PDF en la base de datos
    const pdf = new Pdf({
      codigoCita: codigoCita,
      pdfBase64: pdfBase64.split('base64,')[1], // Extraer solo la parte base64
    });
    await pdf.save(); // Guardar en MongoDB

    // Configuración del correo
    const mailOptions = {
      from: correo,
      to: process.env.EMAIL_USER,
      subject: `Comprobante de Revisión Técnico-Mecánica - Cita ${codigoCita}`,
      text: `Adjunto el comprobante de la revisión para la cita con código: ${codigoCita}.`,
      attachments: [
        {
          filename: `Comprobante_${codigoCita}.pdf`,
          content: pdfBase64.split('base64,')[1], // Extraer solo la parte base64
          encoding: 'base64',
        },
      ],
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
        return res.status(500).json({ error: error.message });
      }
      res.status(200).json({ message: 'Correo enviado y PDF guardado exitosamente', info });
    });

  } catch (error) {
    console.error("Error inesperado en la ruta de envío PDF:", error);
    res.status(500).json({ error: "Ocurrió un error inesperado al procesar la solicitud." });
  }
});

module.exports = router;
