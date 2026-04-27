const express = require("express");
const router = express.Router();

const {
  getStudentsByCourse,
  markAttendance,
  getStudentAttendance,
  getCourseById,
  getMonitoringData } = require("../controllers/attendanceController");

router.get("/students/course", getStudentsByCourse);
router.post("/mark", markAttendance);
router.get("/student", getStudentAttendance);
router.get("/course/:id", getCourseById);
router.get("/monitoring", getMonitoringData);


module.exports = router;