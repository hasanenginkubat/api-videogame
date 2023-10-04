const { Router } = require('express');
const express = require("express");
const videogamesRouter = require("./videogames");

const genresRouter = require("./genres");



const router = Router();
router.use(express.json());
router.use("/videogames", videogamesRouter);
router.use("/genres", genresRouter);



module.exports = router;