const express = require("express");
const router = express.Router();

const { createReport, getReports, addPRLFeedback } = require("../controllers/reportController");

router.post("/create", createReport);
router.get("/", getReports);
router.put("/review", addPRLFeedback);

module.exports = router;