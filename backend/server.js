const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/attendance", attendanceRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});