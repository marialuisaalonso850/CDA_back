const mongoose = require("mongoose");

const RevisionSchema = new mongoose.Schema({
    codigoCita: { 
        type: String, 
        required: true, 
        unique: true 
    },
    placa: { 
        type: String, 
        required: true 
    },
    marca: { 
        type: String, 
        required: true },
    modelo: { 
        type: String, 
        required: true 
    },
    kilometraje: { 
        type: Number, 
        required: true 
    },
    seguridad: {
        frenos: { 
            type: String, 
            enum: ["Aprobado", "Reprobado"], 
            required: true 
        },
        suspension: { 
            type: String, 
            enum: ["Aprobado", "Reprobado"], 
            required: true 
        },
        direccion: { 
            type: String, 
            enum: ["Aprobado", "Reprobado"], 
            required: true },
        llantasRines: { 
            type: String, 
            enum: ["Aprobado", "Reprobado"], 
            required: true 
        },
    },
    ambiental: {
        emisiones: { 
            type: String, 
            enum: ["Dentro del límite", "Fuera del límite"], 
            required: true },
        escape: { 
            type: String, 
            enum: ["Aprobado", "Reprobado"], 
            required: true 
        },
    },
    electricidad: {
        luces: { 
            type: String, 
            enum: ["Funcionando", "No funcionando"], 
            required: true 
        },
        direccionales: { 
            type: String, 
            enum: ["Funcionando", "No funcionando"], 
            required: true 
        },
        claxon: { 
            type: String, 
            enum: ["Funcionando", "No funcionando"], 
            required: true 
        },
    },
    observaciones: { 
        type: String, 
        default: "" 
    },
    estadoFinal: { 
        type: String, 
        enum: ["Aprobado", "Rechazado"], 
        required: true 
    },
    fechaRevision: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Revision", RevisionSchema);