'use strict'

const port = process.env.PORT || 3100;
const CRUD = 'localhost:3000';
const URL_CRUD = `http://${CRUD}/crud`;

const express = require('express');
const logger = require('morgan');
const fetch = require('node-fetch');

const app = express();

//Declaracion de middlewares
app.use(logger('dev'));
app.use(express.urlencoded({extended:false}));//habilita formulario www.form.urlencoded para los body en el http
app.use(express.json());//habilita el objeto json en el body de los http



/**
 * funcion para autorizacion de procesos
 * Authorization => Bearer SuperSeguro 
 * @param {request} req 
 * @param {response} res 
 * @param {continua la ejecucion} next 
 */
function auth (req, res ,next){
    if(!req.headers.authorization){
        res.status(401).json({
            result: 'KO',
            mensaje: "No se ha enviado Bearer token en la cabecera Authorization"
        });
        return next(new Error("Falta token de autorizacion"));
    }

    const queToken = req.headers.authorization.split(" ")[1];
    if( queToken === "SuperSeguro" ){
        req.params.token = queToken;    //nueva propiedad para propagar el token correcto
        return next();
    }

    res.status(401).json({
        result: 'KO',
        mensaje: "Acceso no autorizado."
    });

    return next(new Error("Acceso no autorizado"));
}

//Rutas y controladores

app.get('/api-gw/crud', (req, res, next) => {
    const queURL = `${URL_CRUD}`;

    fetch( queURL )
    .then( resp => resp.json() )
    .then( json => {
        //Logica de negocio
        res.json(  {
            result: json.result,
            contenido: json.colecciones
        });
    });
});

app.get('/api-gw/crud/:colecciones', (req,res,next) => {
    const queColeccion = req.params.colecciones;
    const queURL = `${URL_CRUD}/${queColeccion}`;

    fetch( queURL )
    .then( resp => resp.json() )
    .then( json => {
        //logica de negocio
        res.json({
            result: json.result,
            coleccion: queColeccion,
            elementos: json.elementos
        })
    });
});

app.get('/api-gw/crud/:colecciones/:id', (req,res,next) => {
    const queColeccion = req.params.colecciones;
    const queID = req.params.id;
    const queURL = `${URL_CRUD}/${queColeccion}/${queID}`;

    fetch( queURL )
    .then( resp => resp.json() )
    .then( json => {
        //logica de negocio
        res.json({
            result: json.result,
            coleccion: queColeccion,
            elemento: json.elemento
        })
    });
});

app.post('/api-gw/crud/:colecciones', auth, (req,res,next) => {
    const queColeccion = req.params.colecciones;
    const queURL = `${URL_CRUD}/${queColeccion}`;
    const nuevoElemento = req.body;
    const queToken = req.params.token;

    fetch( queURL , {
        method: 'POST',
        body: JSON.stringify(nuevoElemento),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    })
    .then( resp => resp.json() )
    .then( json => {
        //logica de negocio
        res.json({
            result: json.result,
            coleccion: queColeccion,
            elemento: json.elemento
        })
    });
});



app.listen(port,() => {
    console.log(`API REST GW ejecutandose en http://localhost:${port}/api-gw/`);
});