import { firebase, db, storage } from "../../config/firebaseConfig.js";
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import qrcode from "qrcode";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../../config/stripeConfig.js";
import { ref, listAll, getDownloadURL, getMetadata } from "@firebase/storage";
import axios from "axios";

const stripe = Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const usersRef = collection(db, "users");
const gymsRef = collection(db, "kbgyms");
const reviewsRef = collection(db, "reviews");
const storageRef = ref(storage);

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
  const email = req.query.email;
  const q = query(gymsRef, where("owner", "==", email));
  const querySnapshot = await getDocs(q);
  var gyms = [];
  querySnapshot.forEach((doc) => {
    gyms.push(doc.data());
  });
  res.json({ adminGyms: gyms });
}

export async function handleGetUserRank(req, res) {
  const email = req.query.email;

  try {
    // Get all users ordered by noEntries in descending order
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), orderBy("noEntries", "desc"))
    );

    // Find the index of the user with the specified email
    const userIndex = usersSnapshot.docs.findIndex(
      (doc) => doc.data().email === email
    );

    // Calculate the rank of the user
    const rank = userIndex + 1; // Adding 1 because array indexes start from 0

    // Return the rank and total number of users
    res.json({ rank: rank, noUsers: usersSnapshot.size });
  } catch (error) {
    console.error("Error getting user rank:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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
    const pngQrCode = await qrcode.toDataURL(
      JSON.stringify(gymData) + "|" + uuid,
      {
        type: "png",
      }
    );
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
    const userEmail = req.body.email; // Extract email from request body

    // Retrieve gym data using the provided gymId
    const gymDoc = doc(gymsRef, gymId);
    const gymSnapshot = await getDoc(gymDoc);
    const gymData = gymSnapshot.data();

    if (!gymData) {
      throw new Error("Gym not found");
    }

    const amount = gymData.entryPrice * 100;

    // Create a payment intent for the gym
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "ron",
      payment_method_types: ["card"],
      metadata: {
        gymOwner: gymData.owner,
        gym: gymData.name,
      },
    });

    // Retrieve user document using the provided email
    const userQuery = query(usersRef, where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);
    let userDocId;
    userSnapshot.forEach((doc) => {
      userDocId = doc.id;
    });

    // Update the noEntries field for the user document
    if (userDocId) {
      const userDocRef = doc(usersRef, userDocId);
      await setDoc(
        userDocRef,
        { noEntries: firebase.firestore.FieldValue.increment(1) },
        { merge: true }
      );
    }

    // Update the noEntries field for the gym document
    const updatedNoEntries = (gymData.noEntries || 0) + 1;
    await updateDoc(gymDoc, { noEntries: updatedNoEntries });

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

export async function handleGetPayments(req, res) {
  const gymName = req.query.gymName;
  const sendURL = "https://api.stripe.com/v1/payment_intents";

  const response = await axios.get(sendURL, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });
  var paymentIntents = [];
  response.data.data.forEach((paymentIntent) => {
    if (gymName === paymentIntent.metadata.gym) {
      paymentIntents.push(paymentIntent);
    }
  });
  res.status(200).json({ paymentIntents: paymentIntents });
}

export async function handleCreateReview(req, res) {
  try {
    const reviewData = req.body.reviewData;

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;
    reviewData.date = formattedDate;

    await addDoc(reviewsRef, reviewData);

    res.status(200).json(reviewData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function handleGetVideos(req, res) {
  try {
    const userEmail = req.query.email;
    const listResult = await listAll(storageRef);

    const videoUrls = await Promise.all(
      listResult.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef);
        if (metadata.customMetadata.userEmail === userEmail) {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        }
        return null;
      })
    );

    const filteredVideoUrls = videoUrls.filter((video) => video !== null);

    res.status(200).json(filteredVideoUrls);
  } catch (error) {
    console.error("Error getting videos:", error);
    res.status(500).json({ error: "Error getting videos" });
  }
}
