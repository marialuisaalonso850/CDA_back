const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../auth/generateTokens");
const getUserInfo = require("../lib/getUserInfo");
const Token = require("../schema/token");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "user"] }
});

// 🛠️ Middleware para encriptar la contraseña antes de guardarla
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// 🔍 Método para verificar la contraseña
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// 🔐 Métodos para generar tokens
UserSchema.methods.createAccessToken = function () {
    return generateAccessToken(getUserInfo(this));
};

UserSchema.methods.createRefreshToken = async function () {
    const refreshToken = generateRefreshToken(getUserInfo(this));
    try {
        await new Token({ token: refreshToken }).save();
        return refreshToken;
    } catch (error) {
        console.error(error);
    }
};

module.exports = mongoose.model("User", UserSchema);
