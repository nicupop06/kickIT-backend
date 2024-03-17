import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsXgAu9-HC2AjUjbj3NbyQooZT58-BoDA",
  authDomain: "kickit-b151f.firebaseapp.com",
  databaseURL: "https://kickit-b151f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kickit-b151f",
  storageBucket: "kickit-b151f.appspot.com",
  messagingSenderId: "1051245810914",
  appId: "1:1051245810914:web:aa2a4bddd13362ec12fabb",
  measurementId: "G-DLSMV8T1B1",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage(app);

export { firebase, db, storage };
