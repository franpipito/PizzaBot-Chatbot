'use strict';

const { modeloGemini } = require('../config/gemini');
const pool = require('../db/db');

const CONSULTA_MENU = 'SELECT id, nombre, descripcion, precio, categoria, subcategoria, tamano FROM productos_menu';
const CONSULTA_HORARIOS = 'SELECT dia, horario_apertura, horario_cierre, esta_abierto FROM horarios ORDER BY id';

async function obtenerMenuDesdeBaseDatos() {
  try {
    const [filasMenu] = await pool.query(CONSULTA_MENU);

    if (!Array.isArray(filasMenu)) {
      throw new Error('El formato de los datos del menú es inválido.');
    }

    return filasMenu;
  } catch (error) {
    console.error('Error al consultar el menú en la base de datos:', error.message);
    throw error;
  }
}

async function obtenerHorariosDesdeBaseDatos() {
  try {
    const [filasHorarios] = await pool.query(CONSULTA_HORARIOS);

    if (!Array.isArray(filasHorarios)) {
      throw new Error('El formato de los datos de horarios es inválido.');
    }

    return filasHorarios;
  } catch (error) {
    console.error('Error al consultar los horarios en la base de datos:', error.message);
    throw error;
  }
}

function construirSeccionMenu(menu) {
  let textoMenu = '--- Menú completo ---\n';

  if (!menu || menu.length === 0) {
    textoMenu += 'No hay productos disponibles actualmente.\n';
    return textoMenu.trim();
  }

  for (const producto of menu) {
    const lineaProducto = `${producto.nombre} | ${producto.descripcion || 'Sin descripción'} | Precio: $${producto.precio} | Categoría: ${producto.categoria || 'Sin categoría'}${producto.subcategoria ? ` | Subcategoría: ${producto.subcategoria}` : ''}${producto.tamano ? ` | Tamaño: ${producto.tamano}` : ''}`;
    textoMenu += `${lineaProducto}\n`;
  }

  return textoMenu.trim();
}

function construirSeccionHorarios(horarios) {
  let textoHorarios = '--- Horarios de atención ---\n';

  if (!horarios || horarios.length === 0) {
    textoHorarios += 'No hay horarios configurados actualmente.\n';
    return textoHorarios.trim();
  }

  for (const horario of horarios) {
    const estado = horario.esta_abierto ? 'Abierto' : 'Cerrado';
    const lineaHorario = `${horario.dia}: ${horario.horario_apertura} - ${horario.horario_cierre} (${estado})`;
    textoHorarios += `${lineaHorario}\n`;
  }

  return textoHorarios.trim();
}

function construirPromptConversacional(seccionMenu, seccionHorarios, mensajeUsuario) {
  const instrucciones = 'Eres NonaBot, el asistente virtual de la pizzería La Nona. Usa la información del menú y los horarios para responder de forma amable, clara y en español. Si el usuario solicita un pedido, recaba la información necesaria.';
  const prompt = `${instrucciones}\n\n${seccionMenu}\n\n${seccionHorarios}\n\nMensaje del usuario: ${mensajeUsuario}`;

  return prompt;
}

async function generarRespuestaGemini(prompt) {
  try {
    const resultadoGeneracion = await modeloGemini.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const respuesta = await resultadoGeneracion.response;
    const textoRespuesta = respuesta.text();

    if (!textoRespuesta) {
      throw new Error('La respuesta del modelo está vacía.');
    }

    return textoRespuesta;
  } catch (error) {
    console.error('Error al generar la respuesta con Gemini:', error.message);
    throw error;
  }
}

function validarMensajeUsuario(mensajeUsuario) {
  if (typeof mensajeUsuario !== 'string') {
    throw new Error('El mensaje del usuario debe ser una cadena de texto.');
  }

  const mensajeNormalizado = mensajeUsuario.trim();

  if (mensajeNormalizado.length === 0) {
    throw new Error('El mensaje del usuario no puede estar vacío.');
  }

  return mensajeNormalizado;
}

async function procesarMensaje(mensajeUsuario) {
  try {
    const mensajeValidado = validarMensajeUsuario(mensajeUsuario);

    const menu = await obtenerMenuDesdeBaseDatos();
    const horarios = await obtenerHorariosDesdeBaseDatos();
    const seccionMenu = construirSeccionMenu(menu);
    const seccionHorarios = construirSeccionHorarios(horarios);
    const promptConversacional = construirPromptConversacional(seccionMenu, seccionHorarios, mensajeValidado);
    const respuesta = await generarRespuestaGemini(promptConversacional);

    return respuesta;
  } catch (error) {
    console.error('Error al procesar el mensaje del usuario:', error.message);
    throw error;
  }
}

module.exports = {
  procesarMensaje,
};
