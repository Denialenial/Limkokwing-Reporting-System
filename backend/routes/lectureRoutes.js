const express = require("express");
const router = express.Router();

const { assignLecture, getLectures, getLecturers} = require("../controllers/lectureController");

router.post("/assign", assignLecture);
router.get("/", getLectures);
router.get("/lecturers", getLecturers);

module.exports = router;