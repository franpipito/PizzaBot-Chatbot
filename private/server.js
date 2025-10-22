'use strict';

// Configuración de variables de entorno
require('dotenv').config();

const express = require('express');
const enrutadorChat = require('../private/routes/chatRoutes');

// Crea y configura la aplicación de Express
function crearAplicacion() {
    const aplicacion = express();
    aplicacion.use(express.json());
    aplicacion.get('/', (_req, res) => {
        res.status(200).json({ mensaje: 'Servicio PizzaBot operativo' });
    });
    aplicacion.use('/api/chat', enrutadorChat);
    return aplicacion;
}

// Obtiene el puerto de escucha desde las variables de entorno
function obtenerPuerto() {
    const puerto = process.env.PORT;
    if (!puerto) {
        throw new Error('La variable de entorno PORT no está definida.');
    }
    return puerto;
}

// Inicia el servidor principal de la aplicación
function iniciarServidor() {
    try {
        const aplicacion = crearAplicacion();
        const puerto = obtenerPuerto();
        const servidor = aplicacion.listen(puerto);
        console.log(`Servidor de NonaBot escuchando en el puerto ${puerto}`);
        return servidor;
    } catch (error) {
        console.error('Error al iniciar el servidor de NonaBot:', error);
        process.exit(1);
    }
}

const servidorNonaBot = iniciarServidor();

module.exports = { servidorNonaBot };
