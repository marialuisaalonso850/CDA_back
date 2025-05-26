const request = require('supertest');
const express = require('express');
const router = require('../../routes/placas');
const Placa = require('../../schema/placasValidas');

// Mock de dependencias
jest.mock('../../schema/placasValidas');

describe('Rutas de Placas', () => {
  let app;
  let originalConsoleError;
  
  beforeEach(() => {
    // Guardar la referencia original de console.error
    originalConsoleError = console.error;
    // Reemplazar console.error con un mock vacío
    console.error = jest.fn();
    
    app = express();
    app.use(express.json());
    app.use('/', router);
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restaurar console.error a su implementación original
    console.error = originalConsoleError;
  });

  describe('GET /:placa', () => {
    test('debería obtener un vehículo cuando existe la placa', async () => {
      const mockVehiculo = { 
        placa: 'ABC123', 
        marca: 'Toyota', 
        modelo: 'Corolla',
        anio: 2020
      };
      
      Placa.findOne.mockResolvedValue(mockVehiculo);

      const res = await request(app).get('/ABC123');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockVehiculo);
      expect(Placa.findOne).toHaveBeenCalledWith({ placa: 'ABC123' });
    });

    test('debería devolver 404 si el vehículo no existe', async () => {
      Placa.findOne.mockResolvedValue(null);

      const res = await request(app).get('/XYZ789');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Vehículo no encontrado' });
      expect(Placa.findOne).toHaveBeenCalledWith({ placa: 'XYZ789' });
    });

    test('debería devolver 500 si ocurre un error en el servidor', async () => {
      Placa.findOne.mockRejectedValue(new Error('Error de base de datos'));

      const res = await request(app).get('/ABC123');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Error interno del servidor' });
      // Verificamos que console.error fue llamado (opcional)
      expect(console.error).toHaveBeenCalled();
    });
  });
});