// Requires
var express = require('express');
var Medico = require('../models/medico');
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

    Medico.find({})
        .populate('hospital')
        .populate('usuario', 'nombre email')
        .limit(5)
        .skip(desde)
        .exec(
            (error, medicos) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando usuario",
                        error: error
                    });
                }

                Medico.count({}, (err, contador) => {
                    res.status(200).json({
                        ok: true,
                        medicos,
                        contador
                    });

                })
            })

});

// ==============================================================================
// Obtener medico
// ==============================================================================
app.get('/:id', (req, res, next) => {
    var id = req.params.id;

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.findById(id)
        .populate('hospital')
        .populate('usuario', 'nombre email img')
        .exec(
            ( error, medico ) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando usuario",
                        error: error
                    });
                }

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El medico con el id '+ id + ' no existe',
                        errors: { message: 'No esiste un medico con ese ID' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    medico
                })
            });

});


// ==============================================================================
// Crear un nuevo usuario
// ==============================================================================

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((error, medico) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario usuario",
                error: error
            });
        }

        res.status(201).json({
            ok: true,
            medico,
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

    Medico.findById(id, (error, medico) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Medico",
                error: error
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con el id " + id + " no existe",
                error: error
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((error, medicoGuardado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    error: error
                });
            }
            res.status(201).json({
                ok: true,
                medicoGuardado,
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

    Medico.findOneAndDelete({ _id: id }, (error, medicoBorrado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                error: error
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con el id " + id + " no existe",
                error: { message: "El medico con el id " + id + " no existe" }
            });
        }
        res.status(201).json({
            ok: true,
            medicoBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;