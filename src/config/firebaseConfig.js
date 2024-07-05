import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  //your firebase config
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage(app);

export { firebase, db, storage };
