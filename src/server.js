const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const authenticate = require('./auth/authenticate');

class Server {
    constructor(port) {
        this.port = port || 3000;
        this.ACCESS_TOKEN_SECRET = this.generateTokenSecrets();
        this.REFRESH_TOKEN_SECRET = this.generateTokenSecrets();

        this.app = express();

        this.paths = {
            crearUsuario: '/api/crearUsuario',
            login: '/api/login',
            user: '/api/user',
            signout: '/api/signout',
            todos: '/api/todos',
            refreshToken: '/api/refresh-token',
            citas: '/api/citas',
            eliminar: '/api/eliminarcita',
            home: '/',
            revision: "/api/revisiones",
            placas: "/api/placas",
            enviarPDF: "/api/enviar-pdf"
        };

        this.middlewares();
        this.routes();
        this.connectDB();
        this.saveToken();
    }

    middlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(helmet());
    }

    routes() {
        this.app.use(this.paths.crearUsuario, require('./routes/CrearUsuario'));
        this.app.use(this.paths.login, require('./routes/login'));
        this.app.use(this.paths.user, require('./routes/user'));
        this.app.use(this.paths.signout, require('./routes/signout'));
        this.app.use(this.paths.todos, authenticate, require('./routes/todos'));
        this.app.use(this.paths.refreshToken, require('./routes/refreshToken'));
        this.app.use(this.paths.citas, require('./routes/Agendarcita'));
        this.app.use(this.paths.eliminar, require('./routes/eliminarCita'));
        this.app.use(this.paths.revision, require('./routes/revision'));
        this.app.use(this.paths.placas, require('./routes/placas')); 
        this.app.use(this.paths.enviarPDF, require('./routes/enviarPdf'));// Asegúrate de que este archivo exista y exporte correctamente las rutas.

        // Ruta home básica para verificar que el servidor está funcionando
        this.app.get(this.paths.home, (req, res) => {
            res.json({ message: 'Server is in good state' });
        });
    }

    // Genera secretos para el token de acceso y de actualización
    generateTokenSecrets() {
        return crypto.randomBytes(64).toString("hex");
    }

    // Guarda los secretos generados en las variables de entorno
    saveToken() {
        process.env.ACCESS_TOKEN_SECRET = this.ACCESS_TOKEN_SECRET;
        process.env.REFRESH_TOKEN_SECRET = this.REFRESH_TOKEN_SECRET;
    }

    // Conecta a la base de datos MongoDB
    async connectDB() {
        const Uri = process.env.BD_CONNECTION_STRING;

        if (!Uri) {
            console.error("Error: la cadena de conexión no está definida.");
            process.exit(1);
        }

        try {
            await mongoose.connect(Uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error("Error conectando a MongoDB:", error);
            process.exit(1);
        }
    }

    // Inicia el servidor en el puerto especificado
    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port: ${this.port}`);
        }).on('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        });
    }
}

module.exports = Server;
