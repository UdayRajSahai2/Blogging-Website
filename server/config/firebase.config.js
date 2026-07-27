import admin from "firebase-admin";
import serviceAccountKey from "./reachfoundationngo-firebase-adminsdk-fbsvc-40b436aefc.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

export default admin;

//new
// import admin from "firebase-admin";
// import serviceAccountKey from "./reach-foundation-63bdd-firebase-adminsdk-fbsvc-ca3c18954f.json" with { type: "json" };

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountKey),
// });

// export default admin;
