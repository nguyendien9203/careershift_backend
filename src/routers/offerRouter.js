const express = require("express");
const router = express.Router();
const {  updateOffer, createAndSendOffer, managerApproveOffer, hrUpdateOfferStatus } = require("../controller/offerController");

router.post("/create", createAndSendOffer);
router.put("/update/:offerId", updateOffer);
router.put("/offers/:offerId/approve", managerApproveOffer);
router.put("/offers/:offerId/status", hrUpdateOfferStatus);
module.exports = router;