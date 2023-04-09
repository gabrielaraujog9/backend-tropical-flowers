const express = require('express');
const app = express();
//Rotas
const userRouter = require("./router/userRouter");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use('/users', userRouter);

module.exports = app;