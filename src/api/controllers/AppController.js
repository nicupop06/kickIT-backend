import { firebase, db } from "../../config/firebaseConfig.js";
import { addDoc, collection } from "firebase/firestore";
// import * as Location from "expo-location";

export async function testExpress(req, res) {
  res.json({ message: "Hello, World!" });
}

export async function handleLogIn(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    await firebase.auth().signInWithEmailAndPassword(email, password);
    res.status(200).json({ email: email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function handleSignUp(req, res) {
  try {
    const userData = req.body.userData;

    //Try to sign up a new user
    const email = userData.email;
    const password = userData.password;
    await firebase.auth().createUserWithEmailAndPassword(email, password);

    //Store the user in the db
    delete userData.password;
    await addDoc(collection(db, "users"), userData);

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// export async function handleLocationPermission(req, res) {
//   try {
//     const status = await Location.requestForegroundPermissionsAsync();
//     res.json({ status });
//   } catch (error) {
//     console.error("Error requesting location permission:", error);
//     res.status(500).json({ error: "Failed to request location permission" });
//   }
// }
