const express = require("express");
const authJWT = require("../auth/autenticationJwt");

const router = express.Router();
const shoppingCartController = require("../controllers/shoppingCartController");

router.post("/register/:userId", authJWT, shoppingCartController.create);

router.delete("/:userId", authJWT, shoppingCartController.delete);

module.exports = router;