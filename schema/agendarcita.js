const mongoose = require("mongoose");

const CitaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: { type: String, required: true },
    fechaVencimiento: { type: Date, required: true }, 
    fechaCita: { type: Date, required: true, set: (v) => new Date(v).toISOString().split("T")[0] }, 
    horaCita: { 
        type: String, 
        required: true, 
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // Valida formato HH:MM
            },
            message: props => `${props.value} no es una hora válida (HH:MM formato 24h)`
        }
    },
    placa: { type: String, required: true },
    cdaSeleccionado: { type: String, required: true, enum: ["CDA Norte", "CDA Centro", "CDA Sur"] }, 
}, { timestamps: true }); 

// Índice compuesto para evitar citas duplicadas en la misma fecha, hora y CDA
CitaSchema.index({ fechaCita: 1, horaCita: 1, cdaSeleccionado: 1 }, { unique: true });

const Cita = mongoose.model("Cita", CitaSchema);
module.exports = Cita;
