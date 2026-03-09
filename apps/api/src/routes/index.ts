import { Router } from "express";
import { createRouter } from "../utils/createRouter";

const router = createRouter();
const subRoute = Router();

subRoute.use("/users")

router.get("/", (req, res) => {
  res.json({
    "message": "Welcome to SirojulAnam ConnectHub ReST API"
  })
})

export default router;
