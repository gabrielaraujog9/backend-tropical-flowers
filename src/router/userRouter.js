const express = require('express');
const authJWT = require('../auth/autenticationJwt')

const router = express.Router();
const userController = require('../controllers/userController')

router.get('/', authJWT, userController.getAllUsers);
router.get('/login', userController.loginUser);
router.get('/:id', authJWT, userController.getUserById)

router.post('/register', userController.createUser);

router.put('/:id', authJWT, userController.updateUserById)
module.exports = router;