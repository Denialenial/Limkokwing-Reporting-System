const { firestore } = require("../config/firebase");

exports.assignLecture = async (req, res) => {
  try {
    const {
      lecturerId,
      lecturerName,
      courseId,
      className,
      venue,
      day,
      time
    } = req.body;

    if (!lecturerId || !lecturerName || !courseId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await firestore
      .collection("lectures")
      .where("courseId", "==", courseId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "Course already assigned" });
    }

    const courseDoc = await firestore.collection("courses").doc(courseId).get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = courseDoc.data();

    const studentsSnapshot = await firestore
      .collection("users")
      .where("role", "==", "student")
      .where("program", "==", course.programName)
      .get();

    const totalStudents = studentsSnapshot.size;

    const lectureData = {
      lecturerId,
      lecturerName,
      courseId,
      courseName: course.name,
      courseCode: course.courseCode,
      programName: course.programName,
      facultyName: course.facultyName,
      className,
      venue,
      day,
      time,
      totalStudents,
      createdAt: new Date()
    };

    const doc = await firestore.collection("lectures").add(lectureData);

    res.json({ success: true, id: doc.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLectures = async (req, res) => {
  try {
    const { faculty, lecturerId } = req.query;

    let query = firestore.collection("lectures");

    if (faculty) {
      query = query.where("facultyName", "==", faculty);
    }

    if (lecturerId) {
      query = query.where("lecturerId", "==", lecturerId);
    }

    const snapshot = await query.get();

    const lectures = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLecturers = async (req, res) => {
  try {
    const { faculty } = req.query;

    const snapshot = await firestore
      .collection("users")
      .where("role", "==", "lecturer")
      .where("faculty", "==", faculty)
      .get();

    const lecturers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, lecturers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};