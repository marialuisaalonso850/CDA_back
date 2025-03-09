const express = require("express");
const router = express.Router();
const { jsonResponse } = require("../lib/jsonResponse");
const User = require("../schema/user");

router.post("/", async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(jsonResponse(400, { error: "Usuario y contraseña son requeridos" }));
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json(jsonResponse(400, { error: "Usuario o contraseña incorrectos" }));
        }

        const correctPassword = await user.comparePassword(password);
        if (!correctPassword) {
            return res.status(400).json(jsonResponse(400, { error: "Usuario o contraseña incorrectos" }));
        }

        console.log("✅ Inicio de sesión exitoso para:", user.username);
        return res.status(200).json(jsonResponse(200, { user }));

    } catch (error) {
        console.error("❌ Error en el login:", error);
        return res.status(500).json(jsonResponse(500, { error: "Error interno del servidor" }));
    }
});




module.exports = router;
