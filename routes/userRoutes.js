const express = require('express');
const { signup, login, userInfo } = require('../controllers/userController');

const route = express.Router();

route.post('/signup', signup);
route.post('/login', login);
route.post('/userInfo', userInfo);


module.exports = route;