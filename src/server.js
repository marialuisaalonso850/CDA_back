const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();


const authenticate = require('./auth/authenticate');

class Server {
    constructor(port) {
        this.ACCESS_TOKEN_SECRET = this.generateTokenSecrets();
        this.REFRESH_TOKEN_SECRET = this.generateTokenSecrets();

        this.app = express();
        this.port = port || 3000;

        this.paths = {
            signup: '/api/signup',
            login: '/api/login',
            user: '/api/user',
            signout: '/api/signout',
            todos: '/api/todos',
            refreshToken: '/api/refresh-token',
            citas: '/api/citas',
            eliminar: '/api/eliminarcita',
            home: '/'
        }

        this.middlewares();
        this.routes();
        this.connectDB();
        this.generateTokenSecrets();
        this.saveToken();
    }

    middlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(helmet());  
    }

    routes() {
        this.app.use(this.paths.signup, require('./routes/signup'));
        this.app.use(this.paths.login, require('./routes/login'));
        this.app.use(this.paths.user, authenticate, require('./routes/user'));
        this.app.use(this.paths.signout, require('./routes/signout'));
        this.app.use(this.paths.todos, authenticate, require('./routes/todos'));
        this.app.use(this.paths.refreshToken, require('./routes/refreshToken'));
        this.app.use(this.paths.citas, require('./routes/Agendarcita'));
        this.app.use(this.paths.eliminar, require('./routes/eliminarCita'));
        
        this.app.get(this.paths.home, (req, res) => {
            res.json({ message: 'server in good state'});
        });
    }

    generateTokenSecrets() {
        return crypto.randomBytes(64).toString("hex");
    }
    saveToken() {
        process.env.ACCESS_TOKEN_SECRET = this.ACCESS_TOKEN_SECRET;
        process.env.REFRESH_TOKEN_SECRET = this.REFRESH_TOKEN_SECRET;
    }
    async connectDB() {
        const Uri = process.env.BD_CONNECTION_STRING;
        
        if (!Uri) {
            console.error("Error: no está definida.");
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