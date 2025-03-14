const express = require("express");
const router = express.Router();
const {  hrUpdateOfferStatus } = require("../controller/offerController");

;
router.put("/offers/status/:offerId", hrUpdateOfferStatus);
module.exports = router;