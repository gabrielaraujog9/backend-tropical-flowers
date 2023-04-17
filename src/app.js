const express = require("express");
const app = express();
const userRouter = require("./router/userRouter");
const productRouter = require("./router/productRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", userRouter);
app.use("/products", productRouter);

module.exports = app;
