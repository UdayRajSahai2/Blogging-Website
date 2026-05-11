import admin from "firebase-admin";
import serviceAccountKey from "./reachfoundationngo-firebase-adminsdk-fbsvc-40b436aefc.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

export default admin;
