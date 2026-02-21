import admin from "firebase-admin";
import serviceAccountKey from "./firebase-service-account.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

export default admin;
