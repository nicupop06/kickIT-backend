import express from "express";
import {
  testExpress,
  handleLogIn,
  handleSignUp,
  getKbGyms,
  getUserByEmail
} from "../controllers/AppController.js";

export const appRoutes = express.Router();

appRoutes.get("/test", testExpress);

appRoutes.post("/login", handleLogIn);

appRoutes.post("/signup", handleSignUp);

appRoutes.get("/kbgyms", getKbGyms);

appRoutes.get("/users", getUserByEmail);