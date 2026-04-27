const { firestore, auth } = require("../config/firebase");

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      role,
      faculty,
      program,
    } = req.body;

    if (!name || !email || !password || !role || !faculty) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (role === "student" && !program) {
      return res.status(400).json({ error: "Program is required for students" });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    let courseIds = [];

    if (role === "student") {
      const coursesSnapshot = await firestore
        .collection("courses")
        .where("programName", "==", program)
        .get();

      courseIds = coursesSnapshot.docs.map(doc => doc.id);
    }

    const userData = {
      name,
      email,
      phone: phone || "",
      gender: gender || "",
      role,
      faculty,
      program: role === "student" ? program : null,
      courses: role === "student" ? courseIds : [],
      createdAt: new Date(),
    };

    await firestore.collection("users").doc(userRecord.uid).set(userData);

    if (role === "student" && program) {
      const lecturesSnapshot = await firestore
        .collection("lectures")
        .where("programName", "==", program)
        .get();

      const studentsSnapshot = await firestore
        .collection("users")
        .where("role", "==", "student")
        .where("program", "==", program)
        .get();
      
      const totalStudents = studentsSnapshot.size;

      const batch = firestore.batch();
      lecturesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { totalStudents });
      });
      await batch.commit();
    }

    res.status(201).json({
      success: true,
      user: {
        id: userRecord.uid,
        ...userData,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID required" });
    }

    const userDoc = await firestore.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: uid,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};