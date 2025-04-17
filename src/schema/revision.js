// models/revisionModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subesquemas para las distintas secciones de la revisión
const seguridadSchema = new Schema({
  frenos: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  suspension: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  direccion: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  llantasRines: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  observacionesSeguridad: { type: String, default: "" },
});

const ambientalSchema = new Schema({
  emisiones: { type: String, enum: ["Dentro del límite", "Fuera del límite"], required: true },
  escape: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  observacionesAmbiental: { type: String, default: "" },
});

const electricidadSchema = new Schema({
  luces: { type: String, enum: ["Funcionando", "No Funcionando"], required: true },
  direccionales: { type: String, enum: ["Funcionando", "No Funcionando"], required: true },
  claxon: { type: String, enum: ["Funcionando", "No Funcionando"], required: true },
  observacionesElectricidad: { type: String, default: "" },
});

// Esquema principal para la revisión
const revisionSchema = new Schema(
  {
    placa: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    kilometraje: { type: String, required: true },
    seguridad: seguridadSchema,
    ambiental: ambientalSchema,
    electricidad: electricidadSchema,
    observaciones: { type: String, default: "" },
    estadoFinal: { type: String, enum: ["Aprobado", "Reprobado", "Pendiente"], default: "Pendiente" },
    estadoRevisión: { type: String, enum: ["Pendiente", "Realizada", "Rechazada"], default: "Pendiente" },
    codigoCita: { type: String, required: true },
  },
  { timestamps: true }
);

// Exportación del modelo correctamente
module.exports = mongoose.model('Revision', revisionSchema);
