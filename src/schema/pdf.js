const mongoose = require('mongoose');

// Definición del esquema para almacenar el PDF
const pdfSchema = new mongoose.Schema({
  codigoCita: { type: String, required: true },
  pdfBase64: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Modelo basado en el esquema
const Pdf = mongoose.model('Pdf', pdfSchema);

module.exports = Pdf;
