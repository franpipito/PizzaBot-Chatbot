// Configuración del cliente de Google Gemini para la aplicación NonaBot
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Nombre del modelo que se utilizará para generar las respuestas
const nombreModeloGemini = 'gemini-1.5-flash';

function obtenerClaveGemini() {
  const clave = process.env.GEMINI_API_KEY;

  if (!clave) {
    throw new Error('La clave de la API de Gemini no está definida en las variables de entorno.');
  }

  return clave;
}

function crearClienteGemini(claveGemini) {
  return new GoogleGenerativeAI(claveGemini);
}

function inicializarModeloGemini() {
  try {
    const claveGemini = obtenerClaveGemini();
    const clienteGemini = crearClienteGemini(claveGemini);
    const modeloGemini = clienteGemini.getGenerativeModel({ model: nombreModeloGemini });

    return modeloGemini;
  } catch (error) {
    console.error('Error al inicializar el modelo de Gemini:', error.message);
    throw error;
  }
}

const modeloGemini = inicializarModeloGemini();

module.exports = {
  modeloGemini,
};
