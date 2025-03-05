const express = require("express");
const router = express.Router();
const { createOffer, updateOffer } = require("../controller/offerController");

router.post("/create", createOffer);
router.put("/update", updateOffer);
module.exports = router;