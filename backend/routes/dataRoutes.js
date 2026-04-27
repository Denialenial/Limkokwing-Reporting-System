const express = require("express");
const router = express.Router();

const {getFaculties, getPrograms, getCourses, addCourse, updateCourse, deleteCourse} = require("../controllers/dataController");
router.get("/faculties", getFaculties);
router.get("/programs", getPrograms);
router.post("/courses", addCourse);
router.get("/courses", getCourses);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

module.exports = router;