// Requires
var express = require('express');
const path = require('path');
const fs = require('fs');
// var mongoose = require('mongoose');

// Inicializar variables
var app = express();


app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valida',
            error: { message: 'Los tipo validos son: ' + tiposValidos.join(', ') }
        });

    }

    var pathImage = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../uploads/no-img.jpg');
        res.sendFile(pathNoImage);
    }



    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizada correctamente'
    // });
});

module.exports = app;