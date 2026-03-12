import { createRouter } from "../utils/createRouter.ts";
import userRouter from "./users.ts";
import adminRouter, { setupAdminRoutes } from "./admins.ts";
import { AdminController } from "../controllers/admins.ts";
import { getEntityManager } from "../lib/entityManager.ts";

const router = createRouter();

// Initialize controllers
const adminController = new AdminController(getEntityManager());

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to SirojulAnam ConnectHub ReST API"
  });
});

// API routes, all subroutes on here
router.use("/users", userRouter);
router.use("/admins", setupAdminRoutes(adminController));

export default router;
