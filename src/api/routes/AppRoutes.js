import express from "express";
import {
  testExpress,
  handleLogIn,
  handleSignUp,
} from "../controllers/AppController.js";

export const appRoutes = express.Router();

appRoutes.get("/test", testExpress);

appRoutes.post("/login", handleLogIn);

appRoutes.post("/signup", handleSignUp);