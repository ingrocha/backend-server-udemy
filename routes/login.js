// Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutentificacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// =================================================
// Renorvar Token
// =================================================
app.get('/renuevatoken',mdAutentificacion.verificaToken, ( req, res ) =>{

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: '4h' });

    res.status(200).json({
        ok: true,
        token
    });
})

// =================================================
// Autentificación Google
// =

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload
    }
}
//   verify().catch(console.error);

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });

        });
    // verify()

    // Verificar si existe usuario de google
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                error: error
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google == false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe de usar su autentificación normal",
                    // error: error
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 144000 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu( usuarioDB.role )
                });
            }
        } else {
            // Usurario no existe hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 144000 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu( usuarioDB.role )
                });

            })

        }

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizada correctamente',
    //     googleUser
    // });
});

// =================================================
// Autentificación normal
// =================================================


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
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '4h' });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu( usuarioDB.role )
        });

    });

});


function obtenerMenu( ROLE ) {

    var menu = [{
      titulo: 'Principal',
      icono: 'mdi mdi-gauge',
      submenu: [
        {
          titulo: 'Dashboard',
          url: '/dashboard'
      },
        {
          titulo: 'Progress',
          url: '/progress'
      },
        {
          titulo: 'Gráficas',
          url: '/graficas1'
      },
        {
          titulo: 'Promesas',
          url: '/promesas'
      },
        {
          titulo: 'Rxjs',
          url: '/rxjs'
      }]
    },
    {
      titulo: 'Mantenimientos',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        // {
        //   titulo: 'Usuarios',
        //   url: '/usuarios'
        // },
        {
          titulo: 'Hospitales',
          url: '/hospitales'
        },
        {
          titulo: 'Médicos',
          url: '/medicos'
        },
      ]
    }];

    if ( ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift( {titulo: 'Usuarios', url: '/usuarios'} );
    }

    return menu;
}



module.exports = app;