const request = require('supertest');
const express = require('express');
const { jsonResponse } = require("../../lib/jsonResponse");

// Configuración de mocks para evitar errores 500
jest.mock('../../schema/user', () => {
  return {
    findOne: jest.fn()
  };
});

jest.mock('../../lib/getUserInfo', () => {
  return jest.fn().mockReturnValue({ username: 'usuario' });
});

// Importar el router después de los mocks
const router = require('../login');
const User = require('../../schema/user');

describe('Login Router', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
    jest.clearAllMocks();
  });

  test('debería rechazar cuando faltan credenciales', async () => {
    const res = await request(app).post('/').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(jsonResponse(400, {
      error: "archivos son requeridos"
    }));
  });

  test('debería rechazar cuando el usuario no existe', async () => {
    User.findOne.mockResolvedValue(null);
    
    const res = await request(app)
      .post('/')
      .send({ username: 'usuario', password: 'clave' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(jsonResponse(400, {
      error: "Usuario no encontrado"
    }));
  });

  test('debería rechazar cuando la contraseña es incorrecta', async () => {
    User.findOne.mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
      password: 'hashedPassword'
    });
    
    const res = await request(app)
      .post('/')
      .send({ username: 'usuario', password: 'incorrecta' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(jsonResponse(400, {
      error: "Usuario o contraseña incorrectos"
    }));
  });

  test('debería aceptar con credenciales correctas', async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(true),
      createAccessToken: jest.fn().mockReturnValue('token-acceso'),
      createRefreshToken: jest.fn().mockResolvedValue('token-refresco'),
      password: 'hashedPassword'
    };
    
    User.findOne.mockResolvedValue(mockUser);
    
    const res = await request(app)
      .post('/')
      .send({ username: 'usuario', password: 'correcta' });
    
    expect(res.statusCode).toBe(200);
    
    // Verificar los datos directamente en el cuerpo de la respuesta
    expect(res.body).toHaveProperty('statusCode', 200);
    expect(res.body).toHaveProperty('body');
    
    // Verificar los datos dentro del body
    const responseBody = res.body.body;
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('refreshToken');
    expect(responseBody).toHaveProperty('user');
  });
});