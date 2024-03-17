import { appRoutes } from "./api/routes/AppRoutes.js";
import express from "express";
import bodyPareser from "body-parser";
import cors from 'cors';

const PORT = 3000;
const app = express();

app.use(bodyPareser.json());

app.use("", appRoutes);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}))

app.listen(PORT, () => {
  const message = `Server is running on port ${PORT}`;
  console.log(message);
});
