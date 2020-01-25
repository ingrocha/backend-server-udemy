// Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                error: error
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
                error: { mensaje: "Credenciales incorrectas - email" }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - constraseña",
                error: { mensaje: "Credenciales incorrectas - constraseña" }
            });
        }

        // Crear un token
        usuarioDB.password = '';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 144000 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });

});



module.exports = app;