// Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');

var mdAutentificacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();





// ==============================================================================
// Obtener usuarios
// ==============================================================================

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec((error, usuarios) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuario",
                    error: error
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});




// ==============================================================================
// Crear un nuevo usuario
// ==============================================================================

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
        var body = req.body;

        var usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            img: body.img,
            role: body.role
        });

        usuario.save((error, usuario) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al crear usuario usuario",
                    error: error
                });
            }

            res.status(201).json({
                ok: true,
                usuario: usuario,
                usuarioToken: req.usuario
            });
        });
    })
    // ==============================================================================
    // Actualizar un nuevo usuario
    // ==============================================================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (error, usuario) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                error: error
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el id " + id + " no existe",
                error: error
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioGuardado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    error: error
                });
            }
            usuarioGuardado.password = '';
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });

        });

    });
});

// ==============================================================================
// Eliminar un usuario
// ==============================================================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findOneAndDelete({ _id: id }, (error, usuarioBorrado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                error: error
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el id " + id + " no existe",
                error: { message: "El usuario con el id " + id + " no existe" }
            });
        }
        res.status(201).json({
            ok: true,
            usuarioBorrado: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;