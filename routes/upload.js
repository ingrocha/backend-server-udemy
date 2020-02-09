// Requires
var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');
// var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// default options
app.use(fileUpload());

// modelos

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valida',
            error: { message: 'Los tipo validos son: ' + tiposValidos.join(', ') }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener el nombre de un archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Validar que solo son images|

    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extencionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extencion no valida',
            error: { message: 'Las extenciones validas son: ' + extencionesValidas.join(', ') }
        });

    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(path, err => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al movel el archivo',
                error: err
            });

        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',

        // });
    });


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            var pathViejo = './uploads/usuarios/' + usuario.img;

            if (!usuario) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'No se encontro al usuario',
                    error: err
                });
            }

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = '';

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al movel el archivo',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado

                });

            })

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            var pathViejo = './uploads/medicos/' + medico.img;

            if (!medico) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'No se encontro al medico',
                    error: err
                });
            }

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al movel el archivo',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado

                });

            })

        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            var pathViejo = './uploads/hospitales/' + hospital.img;

            if (!hospital) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'No se encontro al hospital',
                    error: err
                });
            }

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al movel el archivo',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado

                });

            })

        });

    }

}


module.exports = app;