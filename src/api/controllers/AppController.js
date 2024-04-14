import { firebase, db } from "../../config/firebaseConfig.js";
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import qrcode from "qrcode";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../../config/stripeConfig.js";

const stripe = Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const usersRef = collection(db, "users");
const gymsRef = collection(db, "kbgyms");
const reviewsRef = collection(db, "reviews");

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
    const uuid = uuidv4();
    const pngQrCode = await qrcode.toDataURL(gymData.owner + " " + uuid, {
      type: "png",
    });
    gymData.qrCode = pngQrCode;
    await setDoc(doc(gymsRef, uuid), gymData);
    res.status(200).json(gymData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPaymentIntent(req, res) {
  try {
    const gymId = req.body.gymId;
    // Retrieve gym data using the provided gymId
    const gymDoc = doc(gymsRef, gymId);
    const gymSnapshot = await getDoc(gymDoc);
    const amount = gymSnapshot.data().entryPrice * 100;
    // Create a payment intent for the gym
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "ron",
      payment_method_types: ["card"],
    });

    const clientSecret = paymentIntent.client_secret;

    res.json({
      clientSecret: clientSecret,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
}

export async function handleGetReviews(req, res) {
  const gymId = req.query.gymId;
  const q = query(reviewsRef, where("gymId", "==", gymId));
  const querySnapshot = await getDocs(q);
  var reviews = [];
  querySnapshot.forEach((doc) => {
    reviews.push(doc.data());
  });
  res.json({ reviews: reviews });
}

export async function handleCreateReview(req, res) {
  try {
    const reviewData = req.body.reviewData;
    
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
    reviewData.date = formattedDate;

    await addDoc(reviewsRef, reviewData);

    res.status(200).json(reviewData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
