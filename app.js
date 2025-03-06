const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const authenticate = require("./auth/authenticate");
const crypto = require("crypto");

require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Genera tokens secretos aleatorios
const generateTokenSecret = () => {
    return crypto.randomBytes(64).toString("hex");
};

const ACCESS_TOKEN_SECRET = generateTokenSecret();
const REFRESH_TOKEN_SECRET = generateTokenSecret();

// Guarda los tokens secretos en variables de entorno
process.env.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
process.env.REFRESH_TOKEN_SECRET = REFRESH_TOKEN_SECRET;

async function main() {
    await mongoose.connect(process.env.BD_CONNECTION_STRING);
    console.log("Connected to MongoDB :D");
}
main().catch(console.error);

app.use("/api/signup", require("./routes/signup"));
app.use("/api/login", require("./routes/login"));
app.use("/api/user", authenticate, require("./routes/user"));
app.use("/api/signout", require("./routes/signout"));
app.use("/api/todos", authenticate, require("./routes/todos"));
app.use("/api/refresh-token", require("./routes/refreshToken"));
app.use("/api/citas", require("./routes/Agendarcita"));
app.get("/", (req, res) => {
    res.send("hello world");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
