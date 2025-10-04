// router/auth.router.js
const router = require('express').Router();
const auth = require('../controllers/auth.controller');

// Rutas públicas
router.get('/auth/login', auth.viewLogin);
router.get('/auth/register', auth.viewRegister);
router.post('/auth/login', auth.login);
router.post('/auth/register', auth.register);
router.get('/auth/logout', auth.logout);

module.exports = router;
