const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Firebase: Using environment variable credentials");
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error.message);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./serviceAccountKey.json");
    console.log("Firebase: Using local serviceAccountKey.json file");
  } catch (error) {
    console.error("Missing serviceAccountKey.json for local development");
    process.exit(1);
  }
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
  process.exit(1);
}

const firestore = admin.firestore();
const auth = admin.auth();

module.exports = { firestore, auth };