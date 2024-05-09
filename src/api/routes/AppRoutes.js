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
  handleCreateReview,
  handleGetVideos,
  handleGetPayments,
  handleGetUserRank,
} from "../controllers/AppController.js";

export const appRoutes = express.Router();

appRoutes.get("/test", testExpress);

appRoutes.get("/admin-kbgyms", getKbGyms);

appRoutes.get("/users", getUserByEmail);

appRoutes.get("/reviews", handleGetReviews);

appRoutes.get("/videos", handleGetVideos);

appRoutes.post("/login-user", handleLogInUser);

appRoutes.post("/signup-user", handleSignUpUser);

appRoutes.post("/logout", handleLogOut);

appRoutes.post("/signup-gym", handleSignupGym);

appRoutes.post("/stripe-secret", createPaymentIntent);

appRoutes.post("/reviews", handleCreateReview);

appRoutes.get("/payments", handleGetPayments);

appRoutes.get("/user-rank", handleGetUserRank);