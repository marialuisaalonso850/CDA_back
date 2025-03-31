const express = require("express");
const Revision = require("../schema/revision");

const router = express.Router();

// Crear una nueva revisión técnico-mecánica
router.post("/", async (req, res) => {
    try {
        const nuevaRevision = new Revision(req.body);
        await nuevaRevision.save();
        res.status(201).json({ message: "Revisión registrada con éxito", revision: nuevaRevision });
    } catch (error) {
        console.error("Error al registrar la revisión:", error);
        res.status(500).json({ message: "Error al registrar la revisión", error });
    }
});

// Obtener una revisión por código de cita
router.get("/:codigoCita", async (req, res) => {
    try {
        const revision = await Revision.findOne({ codigoCita: req.params.codigoCita });
        if (!revision) {
            return res.status(404).json({ message: "Revisión no encontrada" });
        }
        res.status(200).json(revision);
    } catch (error) {
        console.error("Error al obtener la revisión:", error);
        res.status(500).json({ message: "Error al obtener la revisión", error });
    }
});

module.exports = router;