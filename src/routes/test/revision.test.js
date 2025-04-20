const request = require('supertest');
const express = require('express');
const router = require('../../routes/revision');
const Revision = require('../../schema/revision');
const Cita = require('../../schema/agendarcita');

// Mock de dependencias
jest.mock('../../schema/revision');
jest.mock('../../schema/agendarcita');

describe('Rutas de Revisión', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
    jest.clearAllMocks();
  });

  describe('GET /:codigoCita', () => {
    test('debería obtener una revisión existente', async () => {
      const mockRevision = { codigoCita: 'ABC123', estadoFinal: 'Pendiente' };
      Revision.findOne.mockResolvedValue(mockRevision);

      const res = await request(app).get('/ABC123');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockRevision);
      expect(Revision.findOne).toHaveBeenCalledWith({ codigoCita: 'ABC123' });
    });

    test('debería devolver 404 si la revisión no existe', async () => {
      Revision.findOne.mockResolvedValue(null);

      const res = await request(app).get('/NOEXISTE');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Revisión no encontrada' });
    });
  });

  describe('POST /', () => {
    test('debería crear una nueva revisión', async () => {
      const mockCita = { 
        codigoCita: 'ABC123', 
        estado: 'Pendiente',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Cita.findOne.mockResolvedValue(mockCita);
      
      const mockRevision = {
        codigoCita: 'ABC123',
        estadoFinal: 'Pendiente',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Revision.mockImplementation(() => mockRevision);

      const res = await request(app)
        .post('/')
        .send({ codigoCita: 'ABC123', observaciones: 'Todo bien' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Revisión registrada');
      expect(mockCita.estado).toBe('Tecnomecánica realizada');
      expect(mockCita.save).toHaveBeenCalled();
      expect(mockRevision.save).toHaveBeenCalled();
    });

    test('debería retornar error si falta el código de cita', async () => {
      const res = await request(app).post('/').send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'El código de cita es requerido' });
    });

    test('debería rechazar si la cita ya fue procesada', async () => {
      const mockCita = { codigoCita: 'ABC123', estado: 'Aprobada' };
      Cita.findOne.mockResolvedValue(mockCita);

      const res = await request(app)
        .post('/')
        .send({ codigoCita: 'ABC123' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'La tecnomecánica ya fue realizada o procesada' });
    });
  });

  describe('PUT /aprobar/:codigoCita', () => {
    test('debería aprobar una revisión', async () => {
      const mockCita = { 
        codigoCita: 'ABC123', 
        estado: 'Tecnomecánica realizada',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const mockRevision = {
        codigoCita: 'ABC123',
        estadoFinal: 'Pendiente',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Cita.findOne.mockResolvedValue(mockCita);
      Revision.findOne.mockResolvedValue(mockRevision);

      const res = await request(app).put('/aprobar/ABC123');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Revisión aprobada');
      expect(mockRevision.estadoFinal).toBe('Aprobada');
      expect(mockCita.estado).toBe('Aprobada');
    });

    test('debería rechazar si la cita no está en estado correcto', async () => {
      const mockCita = { codigoCita: 'ABC123', estado: 'Pendiente' };
      Cita.findOne.mockResolvedValue(mockCita);

      const res = await request(app).put('/aprobar/ABC123');
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Solo se puede aprobar una tecnomecánica realizada' });
    });
  });

  describe('PUT /rechazar/:codigoCita', () => {
    test('debería rechazar una revisión', async () => {
      const mockCita = { 
        codigoCita: 'ABC123', 
        estado: 'Tecnomecánica realizada',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const mockRevision = {
        codigoCita: 'ABC123',
        estadoFinal: 'Pendiente',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Cita.findOne.mockResolvedValue(mockCita);
      Revision.findOne.mockResolvedValue(mockRevision);

      const res = await request(app).put('/rechazar/ABC123');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Revisión rechazada');
      expect(mockRevision.estadoFinal).toBe('Rechazada');
      expect(mockCita.estado).toBe('No aprobada');
    });
  });

  describe('PUT /:codigoCita', () => {
    test('debería cambiar el estado manualmente', async () => {
      const mockCita = { 
        codigoCita: 'ABC123', 
        estado: 'Tecnomecánica realizada',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const mockRevision = {
        codigoCita: 'ABC123',
        estadoFinal: 'Pendiente',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Cita.findOne.mockResolvedValue(mockCita);
      Revision.findOne.mockResolvedValue(mockRevision);

      const res = await request(app)
        .put('/ABC123')
        .send({ estado: 'Aprobada' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'La revisión ha sido aprobada.');
      expect(mockRevision.estadoFinal).toBe('Aprobada');
      expect(mockCita.estado).toBe('Aprobada');
    });

    test('debería rechazar estados inválidos', async () => {
      const res = await request(app)
        .put('/ABC123')
        .send({ estado: 'Estado inválido' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Estado de revisión inválido. Solo se permite 'Aprobada' o 'Rechazada'." });
    });
  });
});