const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Cita = require("../schema/agendarcita");
const sendConfirmationCitas = require("./correoCitas");
const router = express.Router();
const Placa = require("../schema/placasValidas");

router.post("/", async (req, res) => {
  try {
    const { nombre, correo, telefono, fechaCita, horaCita, placa, cdaSeleccionado, captchaToken } = req.body;

    // Verificar que todos los campos sean proporcionados
    if (!nombre || !correo || !telefono || !fechaCita || !horaCita || !placa || !cdaSeleccionado || !captchaToken) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validaciones de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) return res.status(400).json({ error: "Formato de correo inválido." });

    const phoneRegex = /^3[0-9]{9}$/;
    if (!phoneRegex.test(telefono)) return res.status(400).json({ error: "Formato de teléfono inválido." });

    const hoy = new Date();
    const fechaCitaDate = new Date(fechaCita);
    if (fechaCitaDate < hoy) return res.status(400).json({ error: "La fecha de la cita no puede ser anterior a hoy." });

    // Normalizar y validar placa
    const placaFormateada = placa.trim().toUpperCase();
    const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
    const placaEspecialRegex = /^[A-Z]{3}[0-9]{2}[A-F]{1}$/;
    if (!placaRegex.test(placaFormateada) && !placaEspecialRegex.test(placaFormateada)) {
      return res.status(400).json({ error: "Formato de placa inválido." });
    }

    // Buscar placa en la base de datos
    const placaRegistrada = await Placa.findOne({ placa: placaFormateada });
    console.log(`Buscando placa en la base de datos: ${placaFormateada}`);
    console.log("Resultado de la búsqueda:", placaRegistrada);

    if (!placaRegistrada) {
      return res.status(400).json({ error: "La placa ingresada no está registrada en el sistema." });
    }

    // Verificar si ya hay una cita en esa fecha, hora y CDA
    const citaDuplicada = await Cita.findOne({ fechaCita, horaCita, cdaSeleccionado });
    if (citaDuplicada) {
      return res.status(400).json({ error: "Ya existe una cita agendada para esta fecha y hora en este CDA." });
    }

    // Generar código único de cita
    const codigoCita = uuidv4();

    // Guardar nueva cita en la base de datos
    const nuevaCita = new Cita({
      codigoCita,
      nombre,
      correo,
      telefono,
      fechaCita,
      horaCita,
      placa: placaFormateada,
      cdaSeleccionado,
      fechaCreacion: new Date()
    });

    await nuevaCita.save();

    // Enviar correo de confirmación
    await sendConfirmationCitas(codigoCita,correo, nombre, fechaCita, horaCita, placaFormateada);

    res.status(201).json({
      message: "Cita agendada con éxito.",
      codigoCita,
      cita: nuevaCita
    });
  } catch (error) {
    console.error("Error al agendar cita:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
