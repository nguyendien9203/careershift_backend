const express = require("express");

const {
  updateOffer,
  createAndSendOffer,
  managerApproveOffer,
  hrUpdateOfferStatus,
} = require("../controllers/offer.controllers");

const router = express.Router();

router.post("/create", createAndSendOffer);
router.put("/update/:offerId", updateOffer);
router.put("/:offerId", managerApproveOffer);
router.put("/status/:offerId", hrUpdateOfferStatus);

module.exports = router;
