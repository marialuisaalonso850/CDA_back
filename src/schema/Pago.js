const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
  codigoCita: { type: String, required: true, unique: true },
  placa: { type: String, required: true },
  tipoVehiculo: { type: String, required: true },
  añoVehiculo: { type: String, required: true },
  antiguedad: { type: Number, required: true },
  valorCalculado: { type: Number, required: true },
  tipoTarjeta: { type: String, required: true },
  numeroTarjeta: { type: String, required: true },
  fechaPago: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pago', PagoSchema);
