import { Router } from "express";
import {
	changePassword,
	getCurrentUser,
	getUsers,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	updateProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

router.use(verifyJWT);

router.get("/me", getCurrentUser);
router.post("/logout", logoutUser);
router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);
router.get("/", getUsers);

export default router;
