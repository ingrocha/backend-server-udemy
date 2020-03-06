// Requires
var express = require('express');
// var mongoose = require('mongoose');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex),
        ])
        .then(respuesta => {
            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2],
            });
        });

});

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(404).json({
                ok: false,
                mensaje: 'No existe esta coleccion',
                error: { message: 'Tipo de tabla/cooleccion no válida' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            mensaje: 'Peticion realizada correctamente',
            [tabla]: data
        });

    });
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err)
                } else {
                    resolve(hospitales);
                }
            })
            .populate('usuario', 'nombre email img')

    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err)
                } else {
                    resolve(medicos);
                }
            })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre');

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuaio', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;