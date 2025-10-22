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
  const instrucciones = `
  Eres NonaBot, un asistente virtual para la pizzería "La Nona". Tu objetivo es tomar pedidos o responder preguntas.
  Tu respuesta DEBE SER SIEMPRE un objeto JSON válido, sin excepción. No escribas texto ni explicaciones antes o después del objeto JSON.

  El JSON debe tener la siguiente estructura:
  {
    "accion": "nombre_de_la_accion",
    "parametros": { ... }
  }

  Las acciones posibles son:
  1. "responder_texto": Úsala para responder preguntas generales, saludar o si no entiendes al usuario.
     - "parametros": { "texto": "Tu respuesta en texto aquí." }
     - Ejemplo: { "accion": "responder_texto", "parametros": { "texto": "¡Hola! Nuestros horarios son de martes a domingo de 20:00 a 23:30 hs." } }

  2. "crear_pedido": Úsala SOLAMENTE cuando tengas toda la información necesaria para un pedido completo.
     - "parametros": {
         "productos": [ { "nombre": "Muzzarella", "cantidad": 1, "tamano": "Grande" }, { "nombre": "Jamón y muzzarella", "cantidad": 6 } ],
         "cliente": { "nombre": "Juan", "info": "Av. Siempreviva 742" },
         "metodo_pago": { "tipo": "efectivo", "detalles": "Paga con 2000" }
       }
     - Ejemplo: { "accion": "crear_pedido", "parametros": { "productos": [{ "nombre": "Napolitana", "cantidad": 1, "tamano": "Grande" }] } }
  
  Analiza el mensaje del usuario y el contexto del menú y los horarios, y genera el JSON con la acción correspondiente. Si faltan datos para un pedido, sigue conversando usando la acción "responder_texto" para pedirlos.
`;
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
    const respuestaGemini = await generarRespuestaGemini(promptConversacional);

    let respuestaObjeto;

    try {
      respuestaObjeto = JSON.parse(respuestaGemini);
    } catch (error) {
      console.error('La respuesta del modelo no es un JSON válido:', error.message);
      throw new Error('No se pudo interpretar la respuesta del asistente.');
    }

    if (!respuestaObjeto || typeof respuestaObjeto !== 'object') {
      throw new Error('La respuesta del asistente no contiene un objeto JSON válido.');
    }

    const accion = respuestaObjeto.accion;
    const parametros = respuestaObjeto.parametros || {};

    switch (accion) {
      case 'responder_texto': {
        if (typeof parametros.texto !== 'string') {
          throw new Error('La acción "responder_texto" requiere un parámetro "texto" válido.');
        }

        return parametros.texto;
      }
      case 'crear_pedido': {
        const mensajeConfirmacion = await guardarPedidoEnBaseDatos(parametros);
        return mensajeConfirmacion;
      }
      default:
        throw new Error(`La acción "${accion}" no es reconocida.`);
    }
  } catch (error) {
    console.error('Error al procesar el mensaje del usuario:', error.message);
    throw error;
  }
}

async function guardarPedidoEnBaseDatos(parametros) {
  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    const productosParametros = Array.isArray(parametros.productos) ? parametros.productos : [];

    if (productosParametros.length === 0) {
      throw new Error('No se recibieron productos para crear el pedido.');
    }

    const datosCliente = parametros.cliente || {};
    const metodoPago = parametros.metodo_pago || {};

    const nombreCliente = typeof datosCliente.nombre === 'string' ? datosCliente.nombre : null;
    const informacionCliente = typeof datosCliente.info === 'string' ? datosCliente.info : null;
    const tipoPago = typeof metodoPago.tipo === 'string' ? metodoPago.tipo : null;
    const detallesPago = typeof metodoPago.detalles === 'string' ? metodoPago.detalles : null;

    const productosCalculados = [];
    let montoTotal = 0;

    for (const productoParametro of productosParametros) {
      if (!productoParametro || typeof productoParametro !== 'object' || !productoParametro.nombre) {
        throw new Error('Cada producto debe incluir un nombre válido.');
      }

      const cantidad = Number(productoParametro.cantidad) > 0 ? Number(productoParametro.cantidad) : 1;
      const nombreProducto = productoParametro.nombre;

      const [filasProducto] = await conexion.query(
        'SELECT id, precio FROM productos_menu WHERE nombre = ?',
        [nombreProducto]
      );

      if (!Array.isArray(filasProducto) || filasProducto.length === 0) {
        throw new Error(`El producto "${nombreProducto}" no existe en el menú.`);
      }

      const productoBase = filasProducto[0];
      const subtotal = productoBase.precio * cantidad;
      montoTotal += subtotal;

      productosCalculados.push({
        idProducto: productoBase.id,
        cantidad,
        precioUnitario: productoBase.precio,
        tamano: productoParametro.tamano || null,
        notas: productoParametro.notas || null,
      });
    }

    const [resultadoPedido] = await conexion.query(
      'INSERT INTO pedidos (nombre_cliente, info_cliente, metodo_pago_tipo, metodo_pago_detalles, monto_total) VALUES (?, ?, ?, ?, ?)',
      [nombreCliente, informacionCliente, tipoPago, detallesPago, montoTotal]
    );

    const idPedido = resultadoPedido.insertId;

    if (!idPedido) {
      throw new Error('No se pudo obtener el identificador del pedido creado.');
    }

    for (const productoCalculado of productosCalculados) {
      await conexion.query(
        'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, tamano, notas) VALUES (?, ?, ?, ?, ?, ?)',
        [
          idPedido,
          productoCalculado.idProducto,
          productoCalculado.cantidad,
          productoCalculado.precioUnitario,
          productoCalculado.tamano,
          productoCalculado.notas,
        ]
      );
    }

    await conexion.commit();

    return 'Tu pedido fue registrado con éxito. ¡Gracias por elegir La Nona!';
  } catch (error) {
    if (conexion) {
      try {
        await conexion.rollback();
      } catch (errorRollback) {
        console.error('Error al revertir la transacción de pedido:', errorRollback.message);
      }
    }

    console.error('Error al guardar el pedido en la base de datos:', error.message);
    throw error;
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

module.exports = {
  procesarMensaje,
};
