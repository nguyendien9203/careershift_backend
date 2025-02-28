const express = require("express");
const { getAllProduct, createProduct } = require("../controllers/productController");

const router = express.Router();

//Get: / Get all product

router.get('/', getAllProduct);
//Post :/Create a new Product
router.post('/create', createProduct);

module.exports = router;