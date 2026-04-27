const { firestore } = require("../config/firebase");

exports.createRating = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      lecturerId,
      lecturerName,
      courseId,
      courseName,
      rating,
      comment,
    } = req.body;

    if (!studentId || !lecturerId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doc = await firestore.collection("ratings").add({
      studentId,
      studentName,
      lecturerId,
      lecturerName,
      courseId,
      courseName,
      rating,
      comment,
      createdAt: new Date(),
    });

    res.json({ success: true, id: doc.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const { lecturerId } = req.query;

    let query = firestore.collection("ratings");

    if (lecturerId) {
      query = query.where("lecturerId", "==", lecturerId);
    }

    const snapshot = await query.get();

    const ratings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, ratings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};