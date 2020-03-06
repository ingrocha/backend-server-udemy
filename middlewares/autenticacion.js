var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==============================================================================
// Verificar token
// ==============================================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                error: error
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
}

// ==============================================================================
// Verificar ADMIN_ROLE
// ==============================================================================
exports.verificaADMIN_ROLE_o_MismoUsuario = function(req, res, next) {
    
        var usuario = req.usuario;
        var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id){
        next();
        return;
    }else{
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                error: { message: "No cuenta con los permisos"}
            });
        
    }
}