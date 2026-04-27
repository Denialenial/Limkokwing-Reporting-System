const { firestore } = require("../config/firebase");

exports.getFaculties = async (req, res) => {
  try {
    const snapshot = await firestore.collection("faculties").get();

    const faculties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, faculties });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const { faculty } = req.query;

    if (!faculty) {
      return res.status(400).json({ error: "Faculty is required" });
    }

    const snapshot = await firestore
      .collection("programs")
      .where("faculty", "==", faculty)
      .get();

    const programs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, programs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { name, courseCode, facultyName, programName } = req.body;

    if (!name || !courseCode || !facultyName || !programName) {
      return res.status(400).json({ error: "All fields required" });
    }

    const doc = await firestore.collection("courses").add({
      name,
      courseCode,
      facultyName,
      programName,
      createdAt: new Date(),
    });

    res.json({ success: true, id: doc.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { faculty } = req.query;

    let query = firestore.collection("courses");

    if (faculty) {
      query = query.where("facultyName", "==", faculty);
    }

    const snapshot = await query.get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, courseCode, programName } = req.body;

    const courseRef = firestore.collection("courses").doc(id);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: "Course not found" });
    }

    await courseRef.update({
      name: name || courseDoc.data().name,
      courseCode: courseCode || courseDoc.data().courseCode,
      programName: programName || courseDoc.data().programName,
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const courseRef = firestore.collection("courses").doc(id);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: "Course not found" });
    }

    await courseRef.delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};