const express = require("express");
const authJWT = require("../auth/autenticationJwt");

const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", authJWT, productController.getAll);
router.get("/:id", authJWT, productController.getById);

router.post("/register", authJWT, productController.create);

router.put("/:id", authJWT, productController.update);

router.delete("/:id", authJWT, productController.delete);

module.exports = router;
