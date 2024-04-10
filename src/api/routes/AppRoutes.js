import express from "express";
import {
  testExpress,
  handleLogInUser,
  handleSignUpUser,
  getKbGyms,
  getUserByEmail,
  handleLogOut,
  handleSignupGym,
  createPaymentIntent,
  handleGetReviews,
} from "../controllers/AppController.js";

export const appRoutes = express.Router();

appRoutes.get("/test", testExpress);

appRoutes.post("/login-user", handleLogInUser);

appRoutes.post("/signup-user", handleSignUpUser);

appRoutes.get("/kbgyms", getKbGyms);

appRoutes.get("/users", getUserByEmail);

appRoutes.post("/logout", handleLogOut);

appRoutes.post("/signup-gym", handleSignupGym);

appRoutes.post("/stripe-secret", createPaymentIntent);

appRoutes.get("/reviews", handleGetReviews);
