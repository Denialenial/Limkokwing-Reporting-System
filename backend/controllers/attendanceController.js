const { firestore } = require("../config/firebase");

exports.getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ error: "courseId required" });
    }

    const snapshot = await firestore
      .collection("users")
      .where("role", "==", "student")
      .get();

    const students = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      if (Array.isArray(data.courses) && data.courses.includes(courseId)) {
        students.push({
          id: doc.id,
          name: data.name,
          present: false
        });
      }
    });

    return res.json({ success: true, students });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { courseId, lecturerId, date, students } = req.body;

    if (!courseId || !lecturerId || !students) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await firestore.collection("attendance").add({
      courseId,
      lecturerId,
      date,
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        present: !!s.present
      })),
      createdAt: new Date()
    });

    return res.json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;

    if (!studentId || !courseId) {
      return res.status(400).json({ error: "studentId and courseId required" });
    }

    const snapshot = await firestore
      .collection("attendance")
      .where("courseId", "==", courseId)
      .get();

    const records = snapshot.docs
      .map(doc => doc.data())
      .filter(data => Array.isArray(data.students))
      .map(data => {
        const student = data.students.find(s => s.id === studentId);

        return student
          ? {
              date: data.date,
              present: student.present,
              courseId: data.courseId
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json({ success: true, records });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await firestore.collection("courses").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.json({
      success: true,
      id: doc.id,
      ...doc.data()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMonitoringData = async (req, res) => {
  try {
    const { faculty } = req.query;

    const lecturesSnap = await firestore
      .collection("lectures")
      .where("facultyName", "==", faculty)
      .get();

    const attendanceSnap = await firestore.collection("attendance").get();

    const monitoring = [];

    lecturesSnap.forEach((lecDoc) => {
      const lecture = lecDoc.data();

      let totalClasses = 0;
      let totalPresent = 0;
      let totalStudents = lecture.totalStudents || 0;

      attendanceSnap.forEach((attDoc) => {
        const att = attDoc.data();

        if (att.courseId === lecture.courseId) {
          totalClasses++;

          const presentCount = att.students.filter(s => s.present).length;
          totalPresent += presentCount;
        }
      });

      const attendanceRate =
        totalClasses && totalStudents
          ? Math.round((totalPresent / (totalStudents * totalClasses)) * 100)
          : 0;

      monitoring.push({
        courseName: lecture.courseName,
        courseCode: lecture.courseCode,
        lecturerName: lecture.lecturerName,
        totalStudents,
        totalClasses,
        attendanceRate,
      });
    });

    res.json({ success: true, monitoring });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};