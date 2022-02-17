// load express router
const route = require('express').Router();

// controllers
const authController = require('../controllers/authController');

// middlewares
const auth = require('../middleware/varifyAuth');
const validator = require('../middleware/validationRules');

// routes
route.get('/user/dashboard', auth.api, (req, res) => {
    res.send('dashboard');
});

route.post('/user/register', validator.newUser, authController.register);
route.post('/user/login', authController.login);
route.get('/user/logout', auth.api, authController.logout);

module.exports = route;