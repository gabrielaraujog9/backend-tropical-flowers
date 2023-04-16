const express = require("express");
const authJWT = require("../auth/autenticationJwt");

const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", authJWT, userController.getAll);
router.get("/login", userController.login);
router.get("/:id", authJWT, userController.getById);

router.post("/register", userController.create);

router.put("/:id", authJWT, userController.updateById);
module.exports = router;
