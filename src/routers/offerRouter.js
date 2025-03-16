const express = require("express");
const router = express.Router();
const {  updateOffer, createAndSendOffer, managerApproveOffer, hrUpdateOfferStatus } = require("../controller/offerController");

router.post("/create", createAndSendOffer);
router.put("/update/:offerId", updateOffer);
router.put("/:offerId", managerApproveOffer);
router.put("/status/:offerId", hrUpdateOfferStatus);
module.exports = router;