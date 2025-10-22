🍕 PizzaBot - Asistente Virtual para Pizzerías con IA
Un chatbot inteligente diseñado para automatizar la toma de pedidos y la atención al cliente en pizzerías, utilizando el poder del lenguaje natural de la API de Google Gemini.

(Recomendación: Graba un GIF corto del bot funcionando y reemplaza este enlace)

📜 Descripción del Proyecto
PizzaBot nace como una solución moderna a un problema común en los locales gastronómicos de barrio: la gestión manual y a veces caótica de los pedidos que llegan por teléfono o mensajes de WhatsApp. Este proyecto implementa un asistente virtual que se integra a una página web (y con potencial para WhatsApp) para guiar a los clientes a través del menú, tomar sus pedidos, procesar pagos y responder preguntas frecuentes, todo de forma conversacional y natural.

El objetivo es doble:

Mejorar la experiencia del cliente, ofreciendo un canal de pedidos rápido, sin esperas y disponible 24/7.

Optimizar la operación del local, liberando al personal de la toma de pedidos para que puedan enfocarse en la preparación y la calidad del producto.

✨ Características Principales
Toma de Pedidos Conversacional: El bot es capaz de entender pedidos complejos en un solo mensaje (ej: "una grande de muzza, 3 empanadas y una coca"), incluyendo productos con múltiples variantes como pizzas mitad y mitad, sándwiches con agregados y más.

Reconocimiento de Lenguaje Natural (NLU): Gracias a la API de Gemini, el bot comprende intenciones, extrae entidades (productos, cantidades, direcciones) y maneja un diálogo fluido.

Gestión de Preguntas Frecuentes (FAQ): Responde automáticamente a preguntas sobre horarios, ubicación, menú, etc.

Integración de Métodos de Pago: Guía al cliente para pagar en efectivo (calculando el cambio) o por transferencia (proporcionando el alias de Mercado Pago).

Sistema de Notificación al Personal: Una vez que el cliente arma su pedido, el sistema envía una notificación detallada al personal de la pizzería para su revisión y confirmación final, manteniendo un control humano en el proceso.

🚀 Stack Tecnológico
Este proyecto fue construido utilizando un stack moderno y eficiente:

Frontend:

HTML5

CSS3

JavaScript (Vanilla JS para la lógica del chat)

Backend:

Node.js

Express.js (para el servidor y la API REST)

Base de Datos:

MySQL (con motor InnoDB)

Inteligencia Artificial:

Google Gemini API (para el procesamiento del lenguaje natural)

Herramientas de Desarrollo:

Vercel v0.dev: Prototipado rápido de la interfaz.

HeidiSQL: Gestión de la base de datos MariaDB/MySQL.

Codex/GitHub Copilot: Asistencia en la generación de código.