const express = require("express");
const dns = require("dns").promises; // Convertir dns.lookup a promesa
const Cita = require("../schema/agendarcita");
const axios = require("axios");

const router = express.Router();

// Función para validar el formato del correo
const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
};

// ✅ 1. Crear una nueva cita con validación de correo y verificación de disponibilidad
router.post("/", async (req, res) => {
    const { nombre, correo, telefono, fechaVencimiento, fechaCita, horaCita, placa, cdaSeleccionado } = req.body;

    if (!nombre || !correo || !telefono || !fechaVencimiento || !fechaCita || !horaCita || !placa || !cdaSeleccionado) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar formato de correo
    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
    }

    // Validar formato del teléfono
    const telefonoRegex = /^[0-9]{7,10}$/;
    if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({ error: "El número de teléfono no es válido." });
    }

    try {
        // Verificar si ya existe una cita en la fecha, hora y CDA seleccionados
        const citaExistente = await Cita.findOne({ fechaCita, horaCita, cdaSeleccionado });
        if (citaExistente) {
            return res.status(400).json({ error: "Ya existe una cita programada en esta fecha, hora y CDA." });
        }

        // Obtener dominio del correo y verificar si es válido
        const dominio = correo.split("@")[1];
        await dns.lookup(dominio);

        // Si todo está correcto, guardar la nueva cita
        const nuevaCita = new Cita({ nombre, correo, telefono, fechaVencimiento, fechaCita, horaCita, placa, cdaSeleccionado });
        await nuevaCita.save();

        res.status(201).json({ message: "Cita agendada correctamente", cita: nuevaCita });

    } catch (error) {
        console.error("Error al agendar la cita:", error);
        if (error.code === "ENOTFOUND") {
            return res.status(400).json({ error: "El dominio del correo no es válido." });
        }
        res.status(500).json({ error: "Error al agendar la cita" });
    }
});

// ✅ 2. Nuevo endpoint: Obtener horas ocupadas en un CDA y fecha específica
router.get("/horas-ocupadas", async (req, res) => {
    const { fechaCita, cdaSeleccionado } = req.query; // Recibimos la fecha y el CDA como query params

    if (!fechaCita || !cdaSeleccionado) {
        return res.status(400).json({ error: "La fecha y el CDA son obligatorios." });
    }

    try {
        const citas = await Cita.find({ fechaCita, cdaSeleccionado }).select("horaCita");
        const horasOcupadas = citas.map(cita => cita.horaCita);
        
        res.json({ horasOcupadas });
    } catch (error) {
        console.error("Error obteniendo horas ocupadas:", error);
        res.status(500).json({ error: "Error al obtener las horas ocupadas." });
    }
});
router.post("/verificar-captcha", async (req, res) => {
    const { captchaToken } = req.body;
    const secretKey = "1e3e5db4-5b58-404e-8cfc-9f7a0c561be8"; // 🚨 REEMPLAZA ESTO

    try {
        const response = await axios.post("https://api.hcaptcha.com/siteverify", null, {
            params: {
                secret: secretKey,
                response: captchaToken,
            },
        });

        if (response.data.success) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, error: "Captcha no válido" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "Error del servidor" });
    }
});

module.exports = router;

