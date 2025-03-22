const express = require("express");

const {
  updateOffer,
  managerApproveOffer,
  hrUpdateOfferStatus,
  createOffer,
  getOffersByStatus,
} = require("../controllers/offer.controllers");

const router = express.Router();

router.post("/create/:candidateId", createOffer);
router.put("/update/:offerId", updateOffer);
router.put("/:offerId", managerApproveOffer);
router.put("/status/:offerId", hrUpdateOfferStatus);
router.get("/listStatus", getOffersByStatus);

module.exports = router;
