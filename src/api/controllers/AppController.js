import { firebase, db } from "../../config/firebaseConfig.js";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
const usersRef = collection(db, "users");

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

export async function getKbGyms(req, res) {
  db.collection("kbgyms")
    .get()
    .then((querySnapshot) => {
      const updatedLocations = querySnapshot.docs.map((doc) => {
        if (doc.data().coords) {
          return { ...doc.data(), id: doc.id };
        }
      });
      res.json({ updatedLocations: updatedLocations });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}

export async function getUserByEmail(req, res) {
  const q = query(usersRef, where("email", "==", req.query.email));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    res.json({ user: doc.data() });
  });
}

