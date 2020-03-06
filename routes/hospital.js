// Requires
var express = require('express');
var Hospital = require('../models/hospital');
// var mongoose = require('mongoose');

var mdAutentificacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// ==============================================================================
// Obtener hospitales
// ==============================================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .limit(5)
        .skip(desde)
        .exec(
            (error, hospitales) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando usuario",
                        error: error
                    });
                }

                Hospital.count({}, (err, contador) => {

                    res.status(200).json({
                        ok: true,
                        hospitales,
                        contador

                    });
                })
            })

});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe ',
                    errors: {
                        message: 'No existe un hospital con ese ID '
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

// ==============================================================================
// Crear un nuevo usuario
// ==============================================================================

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((error, hospital) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario usuario",
                error: error
            });
        }

        res.status(201).json({
            ok: true,
            hospital,
            //usuarioToken: req.usuario
        });
    });
});

// ==============================================================================
// Actualizar un nuevo usuario
// ==============================================================================

app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (error, hospital) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                error: error
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no existe",
                error: error
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((error, hospitalGuardado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    error: error
                });
            }
            res.status(201).json({
                ok: true,
                usuario: hospitalGuardado,
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

    Hospital.findOneAndDelete({ _id: id }, (error, hospitalBorrado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                error: error
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no existe",
                error: { message: "El hospital con el id " + id + " no existe" }
            });
        }
        res.status(201).json({
            ok: true,
            hospitalBorrado: hospitalBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;