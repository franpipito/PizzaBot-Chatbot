'use strict';

// Controlador responsable de manejar los mensajes que provienen del chat
const { procesarMensaje } = require('../services/chatService');

async function manejarMensajeChat(peticion, respuesta) {
  try {
    const { mensaje } = peticion.body || {};

    if (typeof mensaje !== 'string' || mensaje.trim().length === 0) {
      return respuesta.status(400).json({
        exito: false,
        mensaje: 'El mensaje del usuario es obligatorio y no puede estar vacío.',
      });
    }

    const mensajeNormalizado = mensaje.trim();
    const respuestaGenerada = await procesarMensaje(mensajeNormalizado);

    return respuesta.status(200).json({
      exito: true,
      respuesta: respuestaGenerada,
    });
  } catch (error) {
    console.error('Error al manejar el mensaje del chat:', error.message);

    return respuesta.status(500).json({
      exito: false,
      mensaje: 'Ocurrió un error al procesar el mensaje del chat.',
      detalle: error.message,
    });
  }
}

module.exports = {
  manejarMensajeChat,
};
