import { firebase, db } from "../../config/firebaseConfig.js";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
const usersRef = collection(db, "users");
const gymsRef = collection(db, "kbgyms");

export async function testExpress(req, res) {
  res.json({ message: "Hello, World!" });
}

export async function handleLogInUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    await firebase.auth().signInWithEmailAndPassword(email, password);
    res.status(200).json({ email: email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function handleSignUpUser(req, res) {
  try {
    const userData = req.body.userData;

    //Try to sign up a new user
    const email = userData.email;
    const password = userData.password;
    await firebase.auth().createUserWithEmailAndPassword(email, password);

    //Store the user in the db
    delete userData.password;
    await addDoc(usersRef, userData);

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

export async function handleLogOut(req, res) {
  try {
    await firebase.auth().signOut();
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function handleSignupGym(req, res) {
  try {
    const gymData = req.body.gymData;
    await addDoc(gymsRef, gymData);
    res.status(200).json(gymData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
