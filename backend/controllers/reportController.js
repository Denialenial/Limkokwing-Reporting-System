const { firestore } = require("../config/firebase");

exports.createReport = async (req, res) => {
  try {
    const {
      courseId,
      courseName,
      courseCode,
      programName,
      facultyName,
      lecturerId,
      lecturerName,
      week,
      date,
      venue,
      scheduledTime,
      topic,
      learningOutcomes,
      recommendations,
      studentsPresent,
      totalStudents
    } = req.body;

    if (
      !courseId ||
      !lecturerId ||
      !week ||
      !date ||
      !topic ||
      !studentsPresent
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doc = await firestore.collection("reports").add({
      courseId,
      courseName,
      courseCode,
      programName,
      facultyName,
      lecturerId,
      lecturerName,
      week,
      date,
      venue,
      scheduledTime,
      topic,
      learningOutcomes,
      recommendations,
      studentsPresent,
      totalStudents,
      status: "submitted",
      prlFeedback: "",
      prlId: "",
      createdAt: new Date(),
    });

    res.json({ success: true, id: doc.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { faculty } = req.query;

    let query = firestore.collection("reports");

    if (faculty) {
      query = query.where("facultyName", "==", faculty);
    }

    const snapshot = await query.get();

    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPRLFeedback = async (req, res) => {
  try {
    const { reportId, prlId, prlFeedback, status } = req.body;

    if (!reportId || !prlFeedback || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await firestore.collection("reports").doc(reportId).update({
      prlId,
      prlFeedback,
      status,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};