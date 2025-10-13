'use strict';

// Enrutador para gestionar las peticiones relacionadas con el chat
const { Router } = require('express');
const { manejarMensajeChat } = require('../controllers/chatController');

const enrutadorChat = Router();

enrutadorChat.post('/', manejarMensajeChat);

module.exports = enrutadorChat;
