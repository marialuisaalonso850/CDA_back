const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Cita = require("../schema/agendarcita");
const sendConfirmationCitas = require("./correoCitas");
const Placa = require("../schema/placasValidas");

const router = express.Router();

// Crear nueva cita
router.post("/", async (req, res) => {
  try {
    const { nombre, correo, telefono, fechaCita, horaCita, placa, cdaSeleccionado, captchaToken } = req.body;

    // Validar campos requeridos
    if (!nombre || !correo || !telefono || !fechaCita || !horaCita || !placa || !cdaSeleccionado || !captchaToken) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar formato correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: "Formato de correo inválido." });
    }

    // Validar formato teléfono
    const phoneRegex = /^3[0-9]{9}$/;
    if (!phoneRegex.test(telefono)) {
      return res.status(400).json({ error: "Formato de teléfono inválido." });
    }

    // Validar fecha
    const hoy = new Date();
    const fechaCitaDate = new Date(fechaCita);
    if (fechaCitaDate < hoy) {
      return res.status(400).json({ error: "La fecha de la cita no puede ser anterior a hoy." });
    }

    // Validar placa
    const placaFormateada = placa.trim().toUpperCase();
    const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
    const placaEspecialRegex = /^[A-Z]{3}[0-9]{2}[A-F]{1}$/;
    if (!placaRegex.test(placaFormateada) && !placaEspecialRegex.test(placaFormateada)) {
      return res.status(400).json({ error: "Formato de placa inválido." });
    }

    const placaRegistrada = await Placa.findOne({ placa: placaFormateada });
    if (!placaRegistrada) {
      return res.status(400).json({ error: "La placa ingresada no está registrada en el sistema." });
    }

    // Verificar duplicado
    const citaDuplicada = await Cita.findOne({ fechaCita, horaCita, cdaSeleccionado });
    if (citaDuplicada) {
      return res.status(400).json({ error: "Ya existe una cita agendada para esta fecha y hora en este CDA." });
    }

    // Crear cita
    const codigoCita = uuidv4();
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

    // Enviar confirmación
    await sendConfirmationCitas(codigoCita, correo, nombre, fechaCita, horaCita, placaFormateada);

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

// Obtener cita por código
router.get("/:codigoCita", async (req, res) => {
  try {
    const { codigoCita } = req.params;
    const cita = await Cita.findOne({ codigoCita });

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    res.json(cita);
  } catch (error) {
    console.error("Error al buscar la cita:", error);
    res.status(500).json({ error: "Error al buscar la cita." });
  }
});

// Eliminar cita
router.delete("/:codigoCita", async (req, res) => {
  try {
    const { codigoCita } = req.params;
    const citaEliminada = await Cita.findOneAndDelete({ codigoCita });

    if (!citaEliminada) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    res.json({ message: "Cita eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la cita:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Actualizar cita
router.put("/:codigoCita", async (req, res) => {
  try {
    const { codigoCita } = req.params;
    const { nombre, correo, telefono, fechaCita, horaCita, placa, cdaSeleccionado, estado } = req.body;

    // Validar existencia
    const citaExistente = await Cita.findOne({ codigoCita });
    if (!citaExistente) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    // Validaciones si se envían campos
    if (correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ error: "Formato de correo inválido." });
      }
    }

    if (telefono) {
      const phoneRegex = /^3[0-9]{9}$/;
      if (!phoneRegex.test(telefono)) {
        return res.status(400).json({ error: "Formato de teléfono inválido." });
      }
    }

    let placaFormateada;
    if (placa) {
      placaFormateada = placa.trim().toUpperCase();
      const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
      const placaEspecialRegex = /^[A-Z]{3}[0-9]{2}[A-F]{1}$/;
      if (!placaRegex.test(placaFormateada) && !placaEspecialRegex.test(placaFormateada)) {
        return res.status(400).json({ error: "Formato de placa inválido." });
      }
      const placaRegistrada = await Placa.findOne({ placa: placaFormateada });
      if (!placaRegistrada) {
        return res.status(400).json({ error: "La placa ingresada no está registrada en el sistema." });
      }
    }

    if (fechaCita) {
      const hoy = new Date();
      const fechaCitaDate = new Date(fechaCita);
      if (fechaCitaDate < hoy) {
        return res.status(400).json({ error: "La fecha de la cita no puede ser anterior a hoy." });
      }
    }

    // Verificar duplicado si cambian fecha/hora/cda
    if (fechaCita && horaCita && cdaSeleccionado) {
      const citaDuplicada = await Cita.findOne({
        fechaCita,
        horaCita,
        cdaSeleccionado,
        codigoCita: { $ne: codigoCita }
      });
      if (citaDuplicada) {
        return res.status(400).json({ error: "Ya existe una cita para esa fecha, hora y CDA." });
      }
    }

    // Construir actualización
    const actualizaciones = {};
    if (nombre) actualizaciones.nombre = nombre;
    if (correo) actualizaciones.correo = correo;
    if (telefono) actualizaciones.telefono = telefono;
    if (fechaCita) actualizaciones.fechaCita = fechaCita;
    if (horaCita) actualizaciones.horaCita = horaCita;
    if (placaFormateada) actualizaciones.placa = placaFormateada;
    if (cdaSeleccionado) actualizaciones.cdaSeleccionado = cdaSeleccionado;
    if (estado) actualizaciones.estado = estado;

    // Actualizar
    const citaActualizada = await Cita.findOneAndUpdate(
      { codigoCita },
      { $set: actualizaciones },
      { new: true }
    );

    res.json({
      message: "Cita actualizada con éxito.",
      cita: citaActualizada
    });

  } catch (error) {
    console.error("Error al actualizar la cita:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Listar todas las citas
router.get("/", async (req, res) => {
  try {
    const citas = await Cita.find();
    res.status(200).json(citas);
  } catch (error) {
    console.error("Error al obtener todas las citas:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
